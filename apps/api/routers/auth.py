"""
AgentFi — Auth Router
POST /auth/request-otp
POST /auth/verify-otp
GET  /auth/me
"""
import random
import hashlib
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, field_validator
import structlog

from database import get_db
from models import User, OTPVerification, UserStatus, UserRole
from services.auth_service import create_access_token, get_current_user
from services.whatsapp_service import send_whatsapp_message

logger = structlog.get_logger()
router = APIRouter()


# ── Schemas ───────────────────────────────────────────────────────────────────

class OTPRequestSchema(BaseModel):
    whatsapp_number: str

    @field_validator("whatsapp_number")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        v = v.strip().replace(" ", "").replace("-", "")
        if not v.startswith("+"):
            raise ValueError("Phone number must include country code (e.g. +919876543210)")
        if len(v) < 8 or len(v) > 20:
            raise ValueError("Invalid phone number length")
        return v


class OTPVerifySchema(BaseModel):
    whatsapp_number: str
    otp: str
    display_name: str | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    is_new_user: bool


class UserResponse(BaseModel):
    id: str
    whatsapp_number: str
    display_name: str | None
    role: str
    status: str
    wallet_address: str | None
    created_at: datetime

    class Config:
        from_attributes = True


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/request-otp", status_code=200)
async def request_otp(body: OTPRequestSchema, db: AsyncSession = Depends(get_db)):
    """
    Send a 6-digit OTP to the user's WhatsApp number.
    Rate-limited: creates one OTP, valid for 10 minutes.
    """
    # Generate a secure 6-digit OTP
    otp = str(random.SystemRandom().randint(100000, 999999))
    otp_hash = hashlib.sha256(otp.encode()).hexdigest()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)

    # Invalidate old OTPs for this number
    result = await db.execute(
        select(OTPVerification).where(
            OTPVerification.whatsapp_number == body.whatsapp_number,
            OTPVerification.used == False,
        )
    )
    old_otps = result.scalars().all()
    for old in old_otps:
        old.used = True

    # Create new OTP
    otp_record = OTPVerification(
        whatsapp_number=body.whatsapp_number,
        otp_hash=otp_hash,
        expires_at=expires_at,
    )
    db.add(otp_record)
    await db.flush()

    # Send via WhatsApp
    message = f"🔐 Your AgentFi verification code is: *{otp}*\n\nThis code expires in 10 minutes.\n\n_Never share this code with anyone._"
    await send_whatsapp_message(body.whatsapp_number, message)

    logger.info("OTP sent", number=body.whatsapp_number[-4:])
    return {"message": "OTP sent to your WhatsApp number.", "expires_in_minutes": 10}


@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp(body: OTPVerifySchema, db: AsyncSession = Depends(get_db)):
    """
    Verify OTP and create/login user. Returns JWT token.
    """
    otp_hash = hashlib.sha256(body.otp.strip().encode()).hexdigest()
    now = datetime.now(timezone.utc)

    # Find valid OTP
    result = await db.execute(
        select(OTPVerification).where(
            OTPVerification.whatsapp_number == body.whatsapp_number,
            OTPVerification.otp_hash == otp_hash,
            OTPVerification.used == False,
            OTPVerification.expires_at > now,
        )
    )
    otp_record = result.scalar_one_or_none()

    if not otp_record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired OTP. Please request a new one.",
        )

    # Mark OTP as used
    otp_record.used = True

    # Find or create user
    result = await db.execute(
        select(User).where(User.whatsapp_number == body.whatsapp_number)
    )
    user = result.scalar_one_or_none()
    is_new_user = user is None

    if is_new_user:
        user = User(
            whatsapp_number=body.whatsapp_number,
            display_name=body.display_name,
            status=UserStatus.ACTIVE,
        )
        db.add(user)
        await db.flush()
        logger.info("New user created", user_id=str(user.id))

        # Send welcome message
        await send_whatsapp_message(
            body.whatsapp_number,
            "🎉 Welcome to AgentFi!\n\nYour AI agent economy is ready.\n\nI'm creating your secure wallet now... ✨\n\nType *help* anytime to see what I can do."
        )
    else:
        user.last_seen_at = now
        user.status = UserStatus.ACTIVE

    await db.flush()

    # Create JWT token
    token = create_access_token({"sub": str(user.id), "role": user.role.value})

    return TokenResponse(
        access_token=token,
        user_id=str(user.id),
        is_new_user=is_new_user,
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get the currently authenticated user."""
    return current_user

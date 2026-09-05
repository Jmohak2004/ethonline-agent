"""
AgentFi — Users Router
Provides profile management, embedded wallet details, and risk preference updates.
"""
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, Field
import structlog

from database import get_db
from models import User, RiskProfile, RiskLevel, UserRole
from services.auth_service import get_current_user

logger = structlog.get_logger()
router = APIRouter()


class RiskProfileUpdateSchema(BaseModel):
    risk_level: Optional[RiskLevel] = None
    maximum_portfolio_exposure: Optional[float] = Field(None, ge=1, le=100)
    maximum_trade_amount: Optional[float] = Field(None, ge=1)
    daily_loss_limit: Optional[float] = Field(None, ge=1)
    automatic_execution_enabled: Optional[bool] = None
    human_approval_threshold: Optional[float] = Field(None, ge=1)
    stop_loss_percentage: Optional[float] = Field(None, ge=1, le=50)
    take_profit_percentage: Optional[float] = Field(None, ge=1, le=500)
    allowed_assets: Optional[list[str]] = None
    blocked_assets: Optional[list[str]] = None


@router.get("/profile")
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve user profile, wallet address, and active risk settings."""
    # Query risk profile
    result = await db.execute(
        select(RiskProfile).where(RiskProfile.user_id == current_user.id)
    )
    risk_profile = result.scalar_one_or_none()

    risk_data = {}
    if risk_profile:
        risk_data = {
            "risk_level": risk_profile.risk_level.value if hasattr(risk_profile.risk_level, "value") else str(risk_profile.risk_level),
            "maximum_trade_amount": risk_profile.maximum_trade_amount,
            "daily_loss_limit": risk_profile.daily_loss_limit,
            "maximum_portfolio_exposure": risk_profile.maximum_portfolio_exposure,
            "automatic_execution_enabled": risk_profile.automatic_execution_enabled,
            "human_approval_threshold": risk_profile.human_approval_threshold,
            "stop_loss_percentage": risk_profile.stop_loss_percentage,
            "allowed_assets": risk_profile.allowed_assets,
            "blocked_assets": risk_profile.blocked_assets,
        }

    return {
        "id": str(current_user.id),
        "whatsapp_number": current_user.whatsapp_number,
        "display_name": current_user.display_name,
        "role": current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role),
        "status": current_user.status.value if hasattr(current_user.status, "value") else str(current_user.status),
        "wallet_address": current_user.wallet_address,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
        "risk_profile": risk_data
    }


@router.patch("/risk-profile")
async def update_risk_profile(
    payload: RiskProfileUpdateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update risk limits and fail-closed thresholds for the user."""
    result = await db.execute(
        select(RiskProfile).where(RiskProfile.user_id == current_user.id)
    )
    risk_profile = result.scalar_one_or_none()

    if not risk_profile:
        # Create risk profile if not present
        risk_profile = RiskProfile(user_id=current_user.id)
        db.add(risk_profile)

    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(risk_profile, field, val)

    await db.commit()
    await db.refresh(risk_profile)

    logger.info("Updated risk profile for user", user_id=str(current_user.id))
    return {
        "success": True,
        "message": "Risk profile updated successfully",
        "risk_level": risk_profile.risk_level.value if hasattr(risk_profile.risk_level, "value") else str(risk_profile.risk_level),
        "maximum_trade_amount": risk_profile.maximum_trade_amount,
        "daily_loss_limit": risk_profile.daily_loss_limit
    }

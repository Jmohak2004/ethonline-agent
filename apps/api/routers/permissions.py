"""
AgentFi — Permissions Router
Manages scoped session key permissions, spending allowances, and revocations.
"""
import uuid
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from pydantic import BaseModel, Field
import structlog

from database import get_db
from models import Permission, Agent, User
from services.auth_service import get_current_user

logger = structlog.get_logger()
router = APIRouter()


class CreatePermissionSchema(BaseModel):
    agent_id: str
    max_transaction_amount: float = Field(20.0, ge=1.0)
    daily_spending_limit: float = Field(50.0, ge=1.0)
    allowed_actions: List[str] = ["SWAP", "ANALYZE"]
    blocked_actions: List[str] = ["WITHDRAW", "TRANSFER_OWNERSHIP"]
    expires_in_hours: int = Field(24, ge=1, le=720)


@router.post("/")
async def create_permission(
    payload: CreatePermissionSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Grant a restricted, auto-expiring session key permission to an agent."""
    # Find agent
    try:
        agent_uuid = uuid.UUID(payload.agent_id)
        stmt = select(Agent).where(Agent.id == agent_uuid)
    except ValueError:
        stmt = select(Agent).where(Agent.slug == payload.agent_id)

    res = await db.execute(stmt)
    agent = res.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    # Invariant: Never allow withdrawal permissions
    sanitized_blocked = list(set(payload.blocked_actions + ["WITHDRAW", "TRANSFER_OWNERSHIP"]))
    sanitized_allowed = [a for a in payload.allowed_actions if a not in ["WITHDRAW", "TRANSFER_OWNERSHIP"]]

    now = datetime.now(timezone.utc)
    perm = Permission(
        user_id=current_user.id,
        agent_id=agent.id,
        max_transaction_amount=payload.max_transaction_amount,
        daily_spending_limit=payload.daily_spending_limit,
        current_daily_spent=0.0,
        allowed_actions=sanitized_allowed,
        blocked_actions=sanitized_blocked,
        is_active=True,
        expires_at=now + timedelta(hours=payload.expires_in_hours)
    )
    db.add(perm)
    await db.commit()
    await db.refresh(perm)

    logger.info("Granted permission", user_id=str(current_user.id), agent=agent.slug)
    return {
        "success": True,
        "permission_id": str(perm.id),
        "agent_name": agent.name,
        "max_transaction_amount": perm.max_transaction_amount,
        "daily_spending_limit": perm.daily_spending_limit,
        "allowed_actions": perm.allowed_actions,
        "blocked_actions": perm.blocked_actions,
        "expires_at": perm.expires_at.isoformat()
    }


@router.get("/")
async def list_permissions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all active and historical permissions for the user."""
    stmt = (
        select(Permission, Agent)
        .join(Agent, Permission.agent_id == Agent.id)
        .where(Permission.user_id == current_user.id)
        .order_by(Permission.created_at.desc())
    )
    res = await db.execute(stmt)
    rows = res.all()

    return {
        "permissions": [
            {
                "id": str(p.id),
                "agent_name": a.name,
                "agent_slug": a.slug,
                "ens_name": a.ens_name,
                "max_transaction_amount": p.max_transaction_amount,
                "daily_spending_limit": p.daily_spending_limit,
                "current_daily_spent": p.current_daily_spent,
                "allowed_actions": p.allowed_actions,
                "blocked_actions": p.blocked_actions,
                "is_active": p.is_active,
                "expires_at": p.expires_at.isoformat() if p.expires_at else None
            }
            for p, a in rows
        ]
    }


@router.delete("/{permission_id}")
async def delete_permission(
    permission_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Instantly revoke an active permission."""
    try:
        perm_uuid = uuid.UUID(permission_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid permission ID")

    stmt = select(Permission).where(
        and_(Permission.id == perm_uuid, Permission.user_id == current_user.id)
    )
    res = await db.execute(stmt)
    perm = res.scalar_one_or_none()

    if not perm:
        raise HTTPException(status_code=404, detail="Permission not found")

    perm.is_active = False
    await db.commit()

    logger.info("Revoked permission", perm_id=permission_id)
    return {"success": True, "message": f"Permission {permission_id} revoked successfully"}

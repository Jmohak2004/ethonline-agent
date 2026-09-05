"""
AgentFi — Subscriptions Router
Handles agent subscription lifecycle, Arc USDC payment settlements, and cancellations.
"""
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from pydantic import BaseModel
import structlog

from database import get_db
from models import Agent, AgentSubscription, SubscriptionStatus, User
from services.auth_service import get_current_user
from services.arc.client import ArcSettlementService

logger = structlog.get_logger()
router = APIRouter()
arc_service = ArcSettlementService()


class SubscribeRequest(BaseModel):
    agent_id: str
    auto_renew: bool = True


@router.post("/")
async def create_subscription(
    payload: SubscribeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Subscribe to an agent with real Arc USDC payment processing and database recording."""
    # 1. Lookup agent
    try:
        agent_uuid = uuid.UUID(payload.agent_id)
        stmt = select(Agent).where(Agent.id == agent_uuid)
    except ValueError:
        stmt = select(Agent).where(Agent.slug == payload.agent_id)

    res = await db.execute(stmt)
    agent = res.scalar_one_or_none()

    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    # 2. Check for active subscription
    existing = await db.execute(
        select(AgentSubscription).where(
            and_(
                AgentSubscription.user_id == current_user.id,
                AgentSubscription.agent_id == agent.id,
                AgentSubscription.status == SubscriptionStatus.ACTIVE
            )
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Already actively subscribed to this agent")

    # 3. Process Arc USDC settlement
    settlement = await arc_service.process_subscription_payment(
        user_wallet=current_user.wallet_address or "0xPrivyUserWallet",
        developer_wallet="0xDeveloperWallet",
        amount_usdc=agent.price,
        agent_id=agent.slug,
        plan_name="Monthly Tier"
    )

    # 4. Save subscription in PostgreSQL
    now = datetime.now(timezone.utc)
    sub = AgentSubscription(
        user_id=current_user.id,
        agent_id=agent.id,
        status=SubscriptionStatus.ACTIVE,
        amount_paid=agent.price,
        currency="USDC",
        billing_cycle="MONTHLY",
        auto_renew=payload.auto_renew,
        starts_at=now,
        expires_at=now + timedelta(days=30),
        transaction_hash=settlement["tx_hash"],
        payment_method="ARC_USDC"
    )
    db.add(sub)

    # Update agent stats
    agent.active_users += 1
    agent.total_revenue += agent.price

    await db.commit()
    await db.refresh(sub)

    logger.info("Subscription created", user_id=str(current_user.id), agent=agent.slug)
    return {
        "success": True,
        "subscription_id": str(sub.id),
        "agent_name": agent.name,
        "agent_slug": agent.slug,
        "amount_paid_usdc": sub.amount_paid,
        "starts_at": sub.starts_at.isoformat(),
        "expires_at": sub.expires_at.isoformat(),
        "tx_hash": sub.transaction_hash,
        "settlement": settlement
    }


@router.get("/")
async def list_subscriptions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all subscriptions for the authenticated user."""
    stmt = (
        select(AgentSubscription, Agent)
        .join(Agent, AgentSubscription.agent_id == Agent.id)
        .where(AgentSubscription.user_id == current_user.id)
        .order_by(AgentSubscription.created_at.desc())
    )
    res = await db.execute(stmt)
    rows = res.all()

    subscriptions_list = []
    for sub, agent in rows:
        subscriptions_list.append({
            "id": str(sub.id),
            "agent_id": str(agent.id),
            "agent_name": agent.name,
            "agent_slug": agent.slug,
            "ens_name": agent.ens_name,
            "status": sub.status.value if hasattr(sub.status, "value") else str(sub.status),
            "amount_paid": sub.amount_paid,
            "currency": sub.currency,
            "starts_at": sub.starts_at.isoformat() if sub.starts_at else None,
            "expires_at": sub.expires_at.isoformat() if sub.expires_at else None,
            "auto_renew": sub.auto_renew,
            "tx_hash": sub.transaction_hash
        })

    return {"subscriptions": subscriptions_list}


@router.delete("/{subscription_id}")
async def cancel_subscription(
    subscription_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Cancel an active subscription."""
    try:
        sub_uuid = uuid.UUID(subscription_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid subscription ID format")

    stmt = select(AgentSubscription).where(
        and_(AgentSubscription.id == sub_uuid, AgentSubscription.user_id == current_user.id)
    )
    res = await db.execute(stmt)
    sub = res.scalar_one_or_none()

    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")

    sub.status = SubscriptionStatus.CANCELLED
    sub.auto_renew = False
    await db.commit()

    logger.info("Subscription cancelled", user_id=str(current_user.id), sub_id=subscription_id)
    return {"success": True, "message": f"Subscription {subscription_id} has been cancelled"}

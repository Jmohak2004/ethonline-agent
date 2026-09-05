"""
AgentFi — Agents Marketplace Router
GET    /agents              — list/search agents
GET    /agents/:id          — agent detail
POST   /agents              — create agent (developer)
PATCH  /agents/:id          — update agent
POST   /agents/:id/publish  — publish agent
POST   /agents/:id/invoke   — invoke agent
POST   /agents/:id/review   — submit review
GET    /agents/:id/reputation — agent reputation
"""
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from pydantic import BaseModel, Field
import structlog

from database import get_db
from models import (
    Agent, AgentReputation, AgentReview, AgentSubscription, User,
    AgentCategory, AgentPricingModel, AgentStatus, RiskLevel, SubscriptionStatus
)
from services.auth_service import get_current_user

logger = structlog.get_logger()
router = APIRouter()


# ── Schemas ───────────────────────────────────────────────────────────────────

class AgentCreateSchema(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    description: str = Field(min_length=10)
    long_description: Optional[str] = None
    category: AgentCategory
    price: float = Field(ge=0)
    pricing_model: AgentPricingModel = AgentPricingModel.FREE
    risk_level: RiskLevel = RiskLevel.MEDIUM
    capabilities: list[str] = []
    required_permissions: list[str] = []
    manifest: dict = {}
    tags: list[str] = []
    icon_url: Optional[str] = None


class AgentUpdateSchema(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    long_description: Optional[str] = None
    price: Optional[float] = None
    risk_level: Optional[RiskLevel] = None
    icon_url: Optional[str] = None
    tags: Optional[list[str]] = None


class ReviewSchema(BaseModel):
    rating: int = Field(ge=1, le=5)
    review: Optional[str] = Field(default=None, max_length=2000)


class AgentResponse(BaseModel):
    id: str
    name: str
    slug: str
    ens_name: Optional[str]
    description: str
    category: str
    version: str
    price: float
    pricing_model: str
    risk_level: str
    rating: float
    rating_count: int
    active_users: int
    performance_score: float
    reliability_score: float
    maximum_drawdown: float
    status: str
    capabilities: list
    tags: list

    class Config:
        from_attributes = True


# ── Helpers ───────────────────────────────────────────────────────────────────

def slugify(name: str) -> str:
    import re
    return re.sub(r"[^a-z0-9-]", "-", name.lower().strip()).strip("-")


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("/")
async def list_agents(
    category: Optional[AgentCategory] = None,
    pricing_model: Optional[AgentPricingModel] = None,
    risk_level: Optional[RiskLevel] = None,
    max_price: Optional[float] = Query(default=None, ge=0),
    min_rating: Optional[float] = Query(default=None, ge=0, le=5),
    search: Optional[str] = Query(default=None, max_length=100),
    sort_by: str = Query(default="rating", enum=["rating", "price", "active_users", "performance_score"]),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """Search and filter the agent marketplace."""
    query = select(Agent).where(Agent.status == AgentStatus.PUBLISHED)

    if category:
        query = query.where(Agent.category == category)
    if pricing_model:
        query = query.where(Agent.pricing_model == pricing_model)
    if risk_level:
        query = query.where(Agent.risk_level == risk_level)
    if max_price is not None:
        query = query.where(Agent.price <= max_price)
    if min_rating is not None:
        query = query.where(Agent.rating >= min_rating)
    if search:
        query = query.where(
            or_(
                Agent.name.ilike(f"%{search}%"),
                Agent.description.ilike(f"%{search}%"),
            )
        )

    # Sorting
    sort_map = {
        "rating": Agent.rating.desc(),
        "price": Agent.price.asc(),
        "active_users": Agent.active_users.desc(),
        "performance_score": Agent.performance_score.desc(),
    }
    query = query.order_by(sort_map[sort_by])
    query = query.offset(offset).limit(limit)

    result = await db.execute(query)
    agents = result.scalars().all()

    count_query = select(func.count()).where(Agent.status == AgentStatus.PUBLISHED)
    total = (await db.execute(count_query)).scalar()

    return {
        "agents": [AgentResponse.model_validate(a) for a in agents],
        "total": total,
        "offset": offset,
        "limit": limit,
    }


@router.get("/{agent_id}")
async def get_agent(agent_id: str, db: AsyncSession = Depends(get_db)):
    """Get full agent detail by ID or slug."""
    # Try UUID first, then slug
    query = select(Agent).where(
        or_(Agent.slug == agent_id)
    )
    try:
        uid = uuid.UUID(agent_id)
        query = select(Agent).where(or_(Agent.id == uid, Agent.slug == agent_id))
    except ValueError:
        pass

    result = await db.execute(query)
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    # Get reputation
    rep_result = await db.execute(select(AgentReputation).where(AgentReputation.agent_id == agent.id))
    reputation = rep_result.scalar_one_or_none()

    return {
        "agent": AgentResponse.model_validate(agent),
        "manifest": agent.manifest,
        "required_permissions": agent.required_permissions,
        "long_description": agent.long_description,
        "reputation": {
            "reputation_score": reputation.reputation_score if reputation else 0,
            "completed_tasks": reputation.completed_tasks if reputation else 0,
            "uptime_percentage": reputation.uptime_percentage if reputation else 100,
            "maximum_drawdown": reputation.maximum_drawdown if reputation else 0,
        } if reputation else None,
    }


@router.post("/", status_code=201)
async def create_agent(
    body: AgentCreateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new agent (must be AGENT_DEVELOPER or ADMIN)."""
    from models import UserRole
    if current_user.role not in [UserRole.AGENT_DEVELOPER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Only agent developers can create agents. Apply for developer access first.")

    slug = slugify(body.name)
    # Ensure slug uniqueness
    result = await db.execute(select(Agent).where(Agent.slug == slug))
    if result.scalar_one_or_none():
        slug = f"{slug}-{str(uuid.uuid4())[:8]}"

    # Build ENS name
    ens_name = f"{slug}.agentfi.eth"

    agent = Agent(
        name=body.name,
        slug=slug,
        ens_name=ens_name,
        developer_id=current_user.id,
        description=body.description,
        long_description=body.long_description,
        category=body.category,
        price=body.price,
        pricing_model=body.pricing_model,
        risk_level=body.risk_level,
        capabilities=body.capabilities,
        required_permissions=body.required_permissions,
        manifest=body.manifest or {
            "name": body.name,
            "version": "1.0.0",
            "description": body.description,
            "capabilities": body.capabilities,
            "permissions": body.required_permissions,
            "pricing": {"model": body.pricing_model, "amount": str(body.price), "currency": "USDC"},
            "risk_level": body.risk_level,
            "ens_name": ens_name,
        },
        tags=body.tags,
        icon_url=body.icon_url,
    )
    db.add(agent)

    # Create initial reputation record
    reputation = AgentReputation(agent_id=agent.id)
    db.add(reputation)

    await db.flush()
    logger.info("Agent created", agent_id=str(agent.id), name=agent.name)
    return {"agent": AgentResponse.model_validate(agent)}


@router.patch("/{agent_id}")
async def update_agent(
    agent_id: str,
    body: AgentUpdateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an agent (developer only — their own agents)."""
    result = await db.execute(select(Agent).where(Agent.id == uuid.UUID(agent_id)))
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    from models import UserRole
    if agent.developer_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="You can only update your own agents")

    for field, value in body.model_dump(exclude_none=True).items():
        setattr(agent, field, value)

    await db.flush()
    return {"agent": AgentResponse.model_validate(agent)}


@router.post("/{agent_id}/publish")
async def publish_agent(
    agent_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Publish an agent to the marketplace."""
    result = await db.execute(select(Agent).where(Agent.id == uuid.UUID(agent_id)))
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    from models import UserRole
    if agent.developer_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="You can only publish your own agents")

    if not agent.manifest:
        raise HTTPException(status_code=400, detail="Agent must have a manifest before publishing")

    agent.status = AgentStatus.PUBLISHED
    await db.flush()
    return {"message": f"Agent '{agent.name}' published to marketplace", "ens_name": agent.ens_name}


@router.post("/{agent_id}/review")
async def review_agent(
    agent_id: str,
    body: ReviewSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Submit a review for an agent (must be a subscriber)."""
    agent_uuid = uuid.UUID(agent_id)

    # Verify user has/had a subscription
    sub_result = await db.execute(
        select(AgentSubscription).where(
            AgentSubscription.user_id == current_user.id,
            AgentSubscription.agent_id == agent_uuid,
        )
    )
    if not sub_result.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="You must subscribe to an agent before reviewing it")

    # Check for duplicate review
    existing = await db.execute(
        select(AgentReview).where(
            AgentReview.agent_id == agent_uuid,
            AgentReview.user_id == current_user.id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="You have already reviewed this agent")

    review = AgentReview(
        agent_id=agent_uuid,
        user_id=current_user.id,
        rating=body.rating,
        review=body.review,
        is_verified_user=True,
    )
    db.add(review)

    # Update agent's aggregate rating
    result = await db.execute(select(Agent).where(Agent.id == agent_uuid))
    agent = result.scalar_one()
    new_count = agent.rating_count + 1
    agent.rating = ((agent.rating * agent.rating_count) + body.rating) / new_count
    agent.rating_count = new_count

    await db.flush()
    return {"message": "Review submitted", "new_rating": agent.rating}


@router.get("/{agent_id}/reputation")
async def get_agent_reputation(agent_id: str, db: AsyncSession = Depends(get_db)):
    """Get detailed reputation metrics for an agent."""
    result = await db.execute(
        select(AgentReputation).where(AgentReputation.agent_id == uuid.UUID(agent_id))
    )
    rep = result.scalar_one_or_none()
    if not rep:
        raise HTTPException(status_code=404, detail="Reputation data not found for this agent")

    return {
        "reputation_score": rep.reputation_score,
        "breakdown": {
            "performance": rep.performance_score,
            "risk_adjusted_performance": rep.risk_adjusted_score,
            "reliability": rep.reliability_score,
            "user_rating": rep.user_rating_score,
            "strategy_consistency": rep.strategy_consistency,
            "usage": rep.usage_score,
        },
        "weights": {
            "performance": 0.30,
            "risk_adjusted_performance": 0.20,
            "reliability": 0.20,
            "user_rating": 0.15,
            "strategy_consistency": 0.10,
            "usage": 0.05,
        },
        "statistics": {
            "completed_tasks": rep.completed_tasks,
            "failed_tasks": rep.failed_tasks,
            "uptime_percentage": rep.uptime_percentage,
            "maximum_drawdown": rep.maximum_drawdown,
        },
        "last_updated": rep.updated_at,
    }

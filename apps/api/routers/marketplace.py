"""
AgentFi — Marketplace Packs Router
Queries agent packs, bundles, and recommended suites from database.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import structlog

from database import get_db
from models import AgentPack, AgentPackItem, Agent

logger = structlog.get_logger()
router = APIRouter()

STATIC_PACKS_FALLBACK = [
    {
        "id": "beginner-pack",
        "name": "Beginner Safety Pack",
        "slug": "beginner-pack",
        "description": "Perfect for new crypto investors. Covers news catalysts, technical filters, and strict risk limits.",
        "price": 3.0,
        "pricing_model": "SUBSCRIPTION",
        "agents": ["NewsScout", "MarketMind", "RiskGuardian"],
        "rating": 4.9,
        "active_users": 1420,
        "recommended_risk": "LOW"
    },
    {
        "id": "alpha-pack",
        "name": "Balanced Alpha Pack",
        "slug": "alpha-pack",
        "description": "Our flagship multi-agent suite coordinating onchain whale flows, sentiment, and execution.",
        "price": 5.0,
        "pricing_model": "SUBSCRIPTION",
        "agents": ["NewsScout", "MarketMind", "WhaleWatcher Pro", "SentimentAgent", "RiskGuardian"],
        "rating": 4.8,
        "active_users": 2840,
        "recommended_risk": "MEDIUM",
        "highlight": True
    },
    {
        "id": "research-pack",
        "name": "Autonomous Research Pack",
        "slug": "research-pack",
        "description": "Deep DeFi research with inter-agent Hedera x402 data queries and custom MCP recipes.",
        "price": 8.0,
        "pricing_model": "SUBSCRIPTION",
        "agents": ["NewsScout", "WhaleWatcher Pro", "SentimentAgent"],
        "rating": 4.7,
        "active_users": 980,
        "recommended_risk": "HIGH"
    }
]


@router.get("/packs")
async def list_packs(db: AsyncSession = Depends(get_db)):
    """Retrieve all available bundled agent packs."""
    stmt = select(AgentPack).where(AgentPack.is_active == True)
    res = await db.execute(stmt)
    packs = res.scalars().all()

    if packs:
        results = []
        for p in packs:
            results.append({
                "id": str(p.id),
                "name": p.name,
                "slug": p.slug,
                "description": p.description,
                "price": p.price,
                "pricing_model": p.pricing_model.value if hasattr(p.pricing_model, "value") else str(p.pricing_model),
                "rating": p.rating,
                "active_users": p.active_users,
                "discount_percentage": p.discount_percentage
            })
        return {"packs": results}

    return {"packs": STATIC_PACKS_FALLBACK}

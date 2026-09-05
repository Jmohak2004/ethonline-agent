"""
AgentFi — Health Router
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
import redis.asyncio as aioredis
import structlog

from database import get_db
from config import settings

logger = structlog.get_logger()
router = APIRouter()


@router.get("/")
async def health_check(db: AsyncSession = Depends(get_db)):
    """Health check endpoint — verifies DB and Redis connectivity."""
    health = {
        "status": "ok",
        "app": "AgentFi API",
        "version": "1.0.0",
        "env": settings.APP_ENV,
        "trading_mode": settings.TRADING_MODE,
        "services": {},
    }

    # Check PostgreSQL
    try:
        await db.execute(text("SELECT 1"))
        health["services"]["postgres"] = "ok"
    except Exception as e:
        health["services"]["postgres"] = f"error: {str(e)}"
        health["status"] = "degraded"

    # Check Redis
    try:
        r = aioredis.from_url(settings.REDIS_URL)
        await r.ping()
        await r.aclose()
        health["services"]["redis"] = "ok"
    except Exception as e:
        health["services"]["redis"] = f"error: {str(e)}"
        health["status"] = "degraded"

    return health

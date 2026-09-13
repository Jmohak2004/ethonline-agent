"""
AgentFi — Health Router
"""
from fastapi import APIRouter
import redis.asyncio as aioredis
import structlog

from database import mongo_database
from config import settings

logger = structlog.get_logger()
router = APIRouter()


@router.get("/")
async def health_check():
    """Health check endpoint — verifies MongoDB and Redis connectivity."""
    health = {
        "status": "ok",
        "app": "AgentFi API",
        "version": "1.0.0",
        "env": settings.APP_ENV,
        "trading_mode": settings.TRADING_MODE,
        "services": {},
    }

    # Check MongoDB
    try:
        await mongo_database.command("ping")
        health["services"]["mongodb"] = "ok"
    except Exception as e:
        health["services"]["mongodb"] = f"error: {str(e)}"
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

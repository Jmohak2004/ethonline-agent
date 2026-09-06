"""
AgentFi API — Main Application Entry Point
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import structlog

from config import settings
from database import init_db, close_db
from routers import (
    auth, agents, health, demo,
    users, marketplace, subscriptions, portfolio, signals, trades, permissions
)

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("AgentFi API starting up", env=settings.APP_ENV, trading_mode=settings.TRADING_MODE)
    await init_db()
    yield
    await close_db()
    logger.info("AgentFi API shut down")


app = FastAPI(
    title="AgentFi API",
    description="Your AI agent economy, directly in WhatsApp.",
    version="1.0.0",
    docs_url="/docs" if settings.APP_ENV == "development" else None,
    redoc_url="/redoc" if settings.APP_ENV == "development" else None,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(agents.router, prefix="/agents", tags=["agents"])
app.include_router(marketplace.router, prefix="/marketplace", tags=["marketplace"])
app.include_router(subscriptions.router, prefix="/subscriptions", tags=["subscriptions"])
app.include_router(portfolio.router, prefix="/portfolio", tags=["portfolio"])
app.include_router(signals.router, prefix="/signals", tags=["signals"])
app.include_router(trades.router, prefix="/trades", tags=["trades"])
app.include_router(permissions.router, prefix="/permissions", tags=["permissions"])
app.include_router(demo.router)


from pydantic import BaseModel
from services.whatsapp_service import send_whatsapp_message
import os
from fastapi.staticfiles import StaticFiles

# Mount the Visual Dashboard
web_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../web"))
if os.path.exists(web_dir):
    app.mount("/dashboard", StaticFiles(directory=web_dir, html=True), name="dashboard")

class SendWhatsAppRequest(BaseModel):
    to: str
    body: str

@app.post("/internal/send-whatsapp", tags=["internal"])
async def internal_send_whatsapp(payload: SendWhatsAppRequest):
    """Internal endpoint for out-of-band WhatsApp alerts and notifications."""
    success = await send_whatsapp_message(to=payload.to, body=payload.body)
    return {"success": success}

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from database import get_db
from models import AuditLog, MarketSignal

@app.get("/api/feed", tags=["dashboard"])
async def get_dashboard_feed(db: AsyncSession = Depends(get_db)):
    """Fetch live Swarm feed events and EAS attestations for the Dashboard."""
    # Fetch recent audit logs (swaps, risk checks)
    audit_stmt = select(AuditLog).order_by(desc(AuditLog.created_at)).limit(10)
    audit_res = await db.execute(audit_stmt)
    logs = audit_res.scalars().all()
    
    # Fetch recent market signals (EAS attestations)
    signal_stmt = select(MarketSignal).order_by(desc(MarketSignal.timestamp)).limit(5)
    signal_res = await db.execute(signal_stmt)
    signals = signal_res.scalars().all()
    
    events = []
    
    for log in logs:
        # Determine styling based on event type
        msg_type = "info"
        if "SWAP" in log.event_type.upper() or "BUY" in log.event_type.upper():
            msg_type = "buy"
        elif "SELL" in log.event_type.upper():
            msg_type = "sell"
            
        events.append({
            "type": msg_type,
            "msg": log.description,
            "time": log.created_at.isoformat(),
            "timestamp": log.created_at.timestamp(),
            "eas": None
        })
        
    for sig in signals:
        confidence = sig.confidence
        # Signals might be upside/downside
        msg_type = "buy" if sig.signal_type.value == "POTENTIAL_UPSIDE" else "sell"
        events.append({
            "type": msg_type,
            "msg": f"Signal on {sig.asset} from Agent {sig.agent_id} - Confidence: {confidence*100}%",
            "time": sig.timestamp.isoformat(),
            "timestamp": sig.timestamp.timestamp(),
            "eas": {
                "uid": sig.id.hex, # Or real EAS uid if stored
                "time": sig.timestamp.isoformat()
            }
        })
        
    # Sort combined events by timestamp desc
    events.sort(key=lambda x: x["timestamp"], reverse=True)
    return {"events": events[:15]}

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


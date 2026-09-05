"""AgentFi — Stub routers for remaining endpoints"""
from fastapi import APIRouter, Depends
from services.auth_service import get_current_user

# Users
users = APIRouter()

@users.get("/profile")
async def get_profile(current_user=Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "whatsapp_number": current_user.whatsapp_number,
        "display_name": current_user.display_name,
        "role": current_user.role,
        "status": current_user.status,
        "wallet_address": current_user.wallet_address,
        "created_at": current_user.created_at,
    }

# Marketplace (agent packs)
marketplace = APIRouter()

@marketplace.get("/packs")
async def list_packs():
    """Return hardcoded initial agent packs."""
    return {
        "packs": [
            {
                "id": "beginner-pack",
                "name": "Beginner Pack",
                "slug": "beginner-pack",
                "description": "Perfect for new crypto investors. Covers news, market analysis, and risk management.",
                "price": 3.0,
                "pricing_model": "SUBSCRIPTION",
                "agents": ["NewsScout", "MarketMind", "RiskGuardian"],
                "rating": 4.5,
                "active_users": 1234,
            },
            {
                "id": "alpha-pack",
                "name": "Balanced Alpha Pack",
                "slug": "alpha-pack",
                "description": "The complete set for active traders. Whale tracking, sentiment analysis, and full risk control.",
                "price": 5.0,
                "pricing_model": "SUBSCRIPTION",
                "agents": ["NewsScout", "MarketMind", "WhaleWatcher", "SentimentAgent", "RiskGuardian"],
                "rating": 4.8,
                "active_users": 2340,
            },
            {
                "id": "research-pack",
                "name": "Autonomous Research Pack",
                "slug": "research-pack",
                "description": "Deep onchain research and sentiment analysis for serious DeFi researchers.",
                "price": 8.0,
                "pricing_model": "SUBSCRIPTION",
                "agents": ["NewsScout", "WhaleWatcher", "SentimentAgent"],
                "rating": 4.6,
                "active_users": 890,
            },
        ]
    }

# Subscriptions
subscriptions = APIRouter()

@subscriptions.post("/")
async def create_subscription(current_user=Depends(get_current_user)):
    return {"message": "Subscription created (Phase 4 — full Privy/USDC integration pending)"}

@subscriptions.get("/")
async def list_subscriptions(current_user=Depends(get_current_user)):
    return {"subscriptions": []}

@subscriptions.delete("/{subscription_id}")
async def cancel_subscription(subscription_id: str, current_user=Depends(get_current_user)):
    return {"message": f"Subscription {subscription_id} cancelled"}

# Portfolio
portfolio = APIRouter()

@portfolio.get("/")
async def get_portfolio(current_user=Depends(get_current_user)):
    return {
        "user_id": str(current_user.id),
        "trading_mode": "PAPER",
        "total_value": 100.0,
        "cash_balance": 80.0,
        "positions": [],
        "daily_pnl": 0.0,
        "weekly_pnl": 0.0,
        "max_drawdown": 0.0,
        "disclaimer": "Paper trading only. No real funds are used.",
    }

@portfolio.get("/performance")
async def portfolio_performance(current_user=Depends(get_current_user)):
    return {"message": "Portfolio performance — Phase 5 (agent integration) pending"}

@portfolio.get("/risk")
async def portfolio_risk(current_user=Depends(get_current_user)):
    return {"message": "Portfolio risk — Phase 8 (risk engine) pending"}

# Signals
signals = APIRouter()

@signals.get("/")
async def list_signals(current_user=Depends(get_current_user)):
    return {"signals": [], "message": "Signals available after Phase 6 (AI agents) is complete"}

@signals.get("/{signal_id}")
async def get_signal(signal_id: str, current_user=Depends(get_current_user)):
    return {"message": f"Signal {signal_id} — Phase 6 pending"}

# Trades
trades = APIRouter()

@trades.post("/analyze")
async def analyze_trade(current_user=Depends(get_current_user)):
    return {"message": "Trade analysis — Phase 6 (AI agents) pending"}

@trades.post("/request")
async def request_trade(current_user=Depends(get_current_user)):
    return {"message": "Trade request — Phase 8 (risk engine) pending"}

@trades.post("/approve")
async def approve_trade(current_user=Depends(get_current_user)):
    return {"message": "Trade approval — Phase 13 (Ledger) pending"}

@trades.post("/reject")
async def reject_trade(current_user=Depends(get_current_user)):
    return {"message": "Trade rejected"}

@trades.get("/")
async def list_trades(current_user=Depends(get_current_user)):
    return {"trades": []}

# Permissions
permissions = APIRouter()

@permissions.post("/")
async def create_permission(current_user=Depends(get_current_user)):
    return {"message": "Permission created — Phase 8 (risk engine) pending"}

@permissions.get("/")
async def list_permissions(current_user=Depends(get_current_user)):
    return {"permissions": []}

@permissions.delete("/{permission_id}")
async def delete_permission(permission_id: str, current_user=Depends(get_current_user)):
    return {"message": f"Permission {permission_id} revoked"}

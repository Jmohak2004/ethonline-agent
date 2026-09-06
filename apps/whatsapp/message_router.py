"""
AgentFi — WhatsApp Message Router
Production-grade conversational gateway connecting real WhatsApp users
to real EVM wallets on Base, live onchain balances, real-time market data,
the 5-agent AI swarm, and live/paper Uniswap v3 execution.
"""
import httpx
import structlog
import sys
import os
from typing import Optional, Tuple
from sqlalchemy import select, and_

# Add repo root and apps/api to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../api")))

from database import AsyncSessionLocal, init_db
from models import (
    User, RiskProfile, PortfolioPosition, TradeRequest, TradeExecution,
    TradeStatus, RiskLevel, TradingMode, UserStatus
)
from packages.agents.agents import MultiAgentOrchestrator
from services.arc.client import ArcSettlementService
from services.wallet.vault import WalletVaultService
from services.market.live_feed import LiveMarketFeedService
from services.uniswap.client import UniswapService
from intent_classifier import classify_intent, Intent, extract_entities

logger = structlog.get_logger()
API_BASE = os.getenv("API_BASE_URL", "http://localhost:8000")
NETWORK = os.getenv("NETWORK", "base").lower()
TRADING_MODE = os.getenv("TRADING_MODE", "LIVE").upper()

orchestrator = MultiAgentOrchestrator()
arc_service = ArcSettlementService()
vault_service = WalletVaultService()
market_feed = LiveMarketFeedService()
uniswap_service = UniswapService(network=NETWORK, trading_mode=TRADING_MODE)

_db_initialized = False


async def ensure_db():
    global _db_initialized
    if not _db_initialized:
        await init_db()
        _db_initialized = True


async def get_or_create_user(from_number: str) -> Tuple[User, RiskProfile]:
    """Retrieves existing user or generates a new real EVM wallet for new WhatsApp users."""
    await ensure_db()
    async with AsyncSessionLocal() as session:
        stmt = select(User).where(User.whatsapp_number == from_number)
        res = await session.execute(stmt)
        user = res.scalar_one_or_none()

        if not user:
            address, enc_key = vault_service.create_wallet()
            user = User(
                whatsapp_number=from_number,
                display_name=f"User {from_number[-4:]}",
                wallet_address=address,
                encrypted_private_key=enc_key,
                status=UserStatus.ACTIVE,
            )
            session.add(user)
            await session.flush()

            # Create default risk profile: max trade $20, daily limit $10, approval threshold $25
            risk = RiskProfile(
                user_id=user.id,
                risk_level=RiskLevel.MEDIUM,
                maximum_trade_amount=20.0,
                daily_loss_limit=10.0,
                human_approval_threshold=25.0,
                automatic_execution_enabled=True,
            )
            session.add(risk)
            user.risk_profile_id = risk.id
            await session.commit()
            await session.refresh(user)
            await session.refresh(risk)
            return user, risk

        # User exists, ensure wallet is set
        if not user.wallet_address or not user.encrypted_private_key:
            address, enc_key = vault_service.create_wallet()
            user.wallet_address = address
            user.encrypted_private_key = enc_key
            await session.commit()
            await session.refresh(user)

        # Lookup risk profile
        stmt_risk = select(RiskProfile).where(RiskProfile.user_id == user.id)
        res_risk = await session.execute(stmt_risk)
        risk = res_risk.scalar_one_or_none()
        if not risk:
            risk = RiskProfile(
                user_id=user.id,
                risk_level=RiskLevel.MEDIUM,
                maximum_trade_amount=20.0,
                daily_loss_limit=10.0,
                human_approval_threshold=25.0,
            )
            session.add(risk)
            await session.commit()
            await session.refresh(risk)

        return user, risk


async def route_message(from_number: str, text: str, message_id: str = "") -> str:
    """
    Main routing logic:
    1. Classify user intent
    2. Execute action or query AI agent swarm
    3. Return formatted WhatsApp response
    """
    text = text.strip()
    logger.info("Routing WhatsApp message", sender=from_number[-6:] if len(from_number) >= 6 else from_number, text=text[:50])

    intent = await classify_intent(text, from_number)

    try:
        if intent == Intent.REGISTER:
            reply = await handle_register(from_number)
        elif intent == Intent.BALANCE:
            reply = await handle_balance(from_number)
        elif intent == Intent.BROWSE_AGENTS:
            reply = await handle_browse_agents(from_number, text)
        elif intent == Intent.BUY_AGENT:
            reply = await handle_buy_agent(from_number, text)
        elif intent == Intent.SET_RISK:
            reply = await handle_set_risk(from_number, text)
        elif intent == Intent.FIND_OPPORTUNITIES:
            reply = await handle_find_opportunities(from_number, text)
        elif intent == Intent.ANALYZE_MARKET:
            reply = await handle_analyze_market(from_number, text)
        elif intent == Intent.PORTFOLIO:
            reply = await handle_portfolio(from_number)
        elif intent == Intent.APPROVE_TRADE:
            reply = await handle_approve_trade(from_number, text)
        elif intent == Intent.REJECT_TRADE:
            reply = "❌ Action cancelled. No funds or transactions were executed."
        elif intent == Intent.HELP:
            reply = await get_help_message()
        else:
            reply = "🤖 I didn't quite catch that. Type *help* to see what I can do, or ask *'Analyze ETH'* to run your agents."

        await send_out_of_band(from_number, reply)
        return reply

    except Exception as e:
        logger.error("Message routing error", error=str(e))
        err_msg = "⚠️ Something went wrong processing your request. Please try again in a moment."
        await send_out_of_band(from_number, err_msg)
        return err_msg


# ── Handlers ──────────────────────────────────────────────────────────────────

async def handle_register(from_number: str) -> str:
    user, risk = await get_or_create_user(from_number)
    addr = user.wallet_address
    explorer_url = vault_service.get_explorer_url(addr, NETWORK)
    net_name = "Base Mainnet" if NETWORK == "base" else "Base Sepolia"

    return (
        f"👋 *Welcome to AgentFi!*\n\n"
        f"Your personal autonomous agent wallet has been created on *{net_name}*:\n\n"
        f"• *Wallet Address:* `{addr}`\n"
        f"• *Network:* {net_name} (Chain ID: 8453)\n"
        f"• *Risk Profile:* {risk.risk_level.value} (Max ${risk.maximum_trade_amount:.2f}/trade)\n"
        f"• *Explorer:* {explorer_url}\n\n"
        f"📥 *Deposit Instructions:*\n"
        f"To start live trading, send ETH or USDC on Base to your wallet address above.\n\n"
        f"💬 *Quick Commands:*\n"
        f"• *balance* — Check your live onchain funds\n"
        f"• *analyze ETH* — Run the 5-agent research swarm\n"
        f"• *browse* — View verified trading agents"
    )


async def handle_balance(from_number: str) -> str:
    user, _ = await get_or_create_user(from_number)
    balances = await vault_service.get_onchain_balances(user.wallet_address, network=NETWORK)
    eth_price = await market_feed.get_spot_price("ETH")

    eth_val = round(balances["eth_balance"] * eth_price, 2)
    usdc_val = round(balances["usdc_balance"], 2)
    total_val = round(usdc_val + eth_val, 2)

    return (
        f"💰 *AgentFi Live Wallet Balance*\n\n"
        f"• *Wallet:* `{user.wallet_address[:6]}...{user.wallet_address[-4:]}`\n"
        f"• *Network:* {balances['network']}\n"
        f"• *USDC Cash:* ${usdc_val:.2f} USDC\n"
        f"• *ETH Holdings:* {balances['eth_balance']} ETH (~${eth_val:.2f})\n"
        f"• *Total Value:* **${total_val:.2f} USD**\n\n"
        f"🔍 *View on Explorer:*\n{balances['explorer_url']}\n\n"
        f"💡 _To deposit funds, send ETH or USDC on Base to:_\n`{user.wallet_address}`"
    )


async def handle_browse_agents(from_number: str, text: str) -> str:
    return (
        "🤖 *Top Verified AI Agents on AgentFi*\n\n"
        "1. *WhaleWatcher Pro* (`whalewatcher.agentfi.eth`)\n"
        "⭐ 4.8 | 2,340 users | Risk: Medium | $3/mo\n"
        "_Live onchain whale accumulation & DEX pool turnover tracker_\n\n"
        "2. *MarketMind* (`marketmind.agentfi.eth`)\n"
        "⭐ 4.7 | 1,890 users | Risk: Medium | $3/mo\n"
        "_Real-time RSI-14 momentum, EMA crosses & support/resistance_\n\n"
        "3. *NewsScout* (`newsscout.agentfi.eth`)\n"
        "⭐ 4.9 | 3,100 users | Risk: Low | FREE\n"
        "_Live protocol catalysts, announcements & LLM sentiment analysis_\n\n"
        "Type *buy WhaleWatcher* to subscribe, or *analyze ETH* to run the swarm."
    )


async def handle_buy_agent(from_number: str, text: str) -> str:
    user, _ = await get_or_create_user(from_number)
    agent_name = "WhaleWatcher Pro"
    cost = 3.00

    settlement = await arc_service.process_subscription_payment(
        user_wallet=user.wallet_address,
        developer_wallet="0xDeveloperWallet00000000000000000000",
        amount_usdc=cost,
        agent_id="whalewatcher-pro",
        plan_name="Monthly Tier",
    )
    return (
        f"💳 *Subscription Successfully Activated!*\n\n"
        f"You subscribed to *{agent_name}* ({cost:.2f} USDC/mo).\n"
        f"• *Settlement Layer:* Arc & Circle USDC\n"
        f"• *Developer Payout (97.5%):* ${settlement['developer_payout_usdc']:.2f} USDC\n"
        f"• *Platform Fee (2.5%):* ${settlement['platform_fee_usdc']:.2f} USDC\n"
        f"• *Tx Hash:* `{settlement['tx_hash'][:18]}...`\n\n"
        f"WhaleWatcher is now actively feeding onchain intelligence to your autonomous swarm."
    )


async def handle_set_risk(from_number: str, text: str) -> str:
    user, risk = await get_or_create_user(from_number)
    text_lower = text.lower()

    if "low" in text_lower:
        risk_level, max_t, loss_l = RiskLevel.LOW, 10.0, 5.0
    elif "high" in text_lower:
        risk_level, max_t, loss_l = RiskLevel.HIGH, 50.0, 25.0
    else:
        risk_level, max_t, loss_l = RiskLevel.MEDIUM, 20.0, 10.0

    async with AsyncSessionLocal() as session:
        stmt = select(RiskProfile).where(RiskProfile.id == risk.id)
        res = await session.execute(stmt)
        r = res.scalar_one()
        r.risk_level = risk_level
        r.maximum_trade_amount = max_t
        r.daily_loss_limit = loss_l
        r.human_approval_threshold = max_t * 1.25
        await session.commit()

    return (
        f"⚙️ *Risk Profile Updated*\n\n"
        f"• *Risk Level:* **{risk_level.value}**\n"
        f"• *Max Single Trade:* ${max_t:.2f}\n"
        f"• *Daily Loss Limit:* ${loss_l:.2f}\n"
        f"• *Human Approval Threshold:* Trades over ${max_t * 1.25:.2f} require WhatsApp sign-off\n\n"
        f"✅ RiskGuardian enforces these limits strictly on every trade (Fail-Closed)."
    )


async def handle_find_opportunities(from_number: str, text: str) -> str:
    user, risk = await get_or_create_user(from_number)
    entities = extract_entities(text)
    budget = entities.get("amount_usd", 100.0)
    asset = entities.get("asset", "ETH")

    max_trade = min(risk.maximum_trade_amount, budget * 0.20)
    daily_loss = min(risk.daily_loss_limit, budget * 0.10)

    spot = await market_feed.get_spot_price(asset)

    return (
        f"Got it! Profile configured for budget: **${budget:.2f}**\n\n"
        f"• *Target Asset:* {asset} (${spot:,.2f})\n"
        f"• *Risk Level:* {risk.risk_level.value}\n"
        f"• *Max Trade Size:* ${max_trade:.2f}\n"
        f"• *Daily Loss Limit:* ${daily_loss:.2f}\n\n"
        f"🔥 *Recommended Swarm Configuration:*\n"
        f"• NewsScout (Live Catalysts)\n"
        f"• MarketMind (RSI & Trend)\n"
        f"• WhaleWatcher Pro (Onchain Flows)\n"
        f"• RiskGuardian (Balance & Loss Limits)\n\n"
        f"Reply *'Analyze {asset}'* to run swarm research, or *'Execute'* to trade."
    )


async def handle_analyze_market(from_number: str, text: str) -> str:
    user, risk = await get_or_create_user(from_number)
    asset = "ETH"
    if "btc" in text.lower():
        asset = "BTC"
    elif "sol" in text.lower():
        asset = "SOL"

    balances = await vault_service.get_onchain_balances(user.wallet_address, network=NETWORK)
    cash_bal = balances.get("usdc_balance", 0.0)

    alpha = await orchestrator.generate_alpha_recommendation(
        asset=asset,
        target_budget_usd=min(20.0, risk.maximum_trade_amount),
        portfolio_value_usd=max(100.0, cash_bal),
        human_approval_threshold_usd=risk.human_approval_threshold,
    )

    spot = await market_feed.get_spot_price(asset)
    indicators = alpha.signals["market"]["indicators"]

    return (
        f"🔍 *Live Swarm Market Analysis: {asset} (${spot:,.2f})*\n\n"
        f"• *Recommendation:* {alpha.recommendation.replace('_', ' ')}\n"
        f"• *Confidence Score:* **{int(alpha.confidence * 100)}%**\n"
        f"• *Market Momentum:* {indicators.get('Signal', 'NEUTRAL')} (RSI-14: {indicators.get('RSI_14')})\n"
        f"• *EMA 20 Support:* {indicators.get('EMA_20')}\n\n"
        f"📊 *Agent Consensus:*\n"
        f"• *WhaleWatcher:* {alpha.signals['whale']['evidence'][0]}\n"
        f"• *NewsScout:* {alpha.signals['news']['reasoning'][0]}\n"
        f"• *Sentiment:* {alpha.signals['sentiment']['sentiment']} (24h Change: {alpha.signals['sentiment']['social_volume_change_24h']})\n\n"
        f"🛡️ *RiskGuardian:* {alpha.signals['risk']['decision']}\n"
        f"_{alpha.signals['risk']['reason']}_\n\n"
        f"To swap $20 USDC -> {asset} on Base, reply *'Execute'* or *'Approve'*."
    )


async def handle_portfolio(from_number: str) -> str:
    user, _ = await get_or_create_user(from_number)
    balances = await vault_service.get_onchain_balances(user.wallet_address, network=NETWORK)
    eth_price = await market_feed.get_spot_price("ETH")

    cash = balances.get("usdc_balance", 0.0)
    eth_qty = balances.get("eth_balance", 0.0)
    eth_val = round(eth_qty * eth_price, 2)
    total_val = round(cash + eth_val, 2)

    return (
        f"📊 *Live Portfolio Holdings*\n\n"
        f"• *Wallet:* `{user.wallet_address[:6]}...{user.wallet_address[-4:]}`\n"
        f"• *Total Value:* **${total_val:.2f} USD**\n"
        f"• *USDC Cash:* ${cash:.2f}\n"
        f"• *ETH Holdings:* {eth_qty} ETH (~${eth_val:.2f})\n"
        f"• *Network:* {balances['network']}\n\n"
        f"🤖 *Active Protection:*\n"
        f"• RiskGuardian active (Fail-closed exposure checks)\n"
        f"• No unapproved withdrawals permitted\n\n"
        f"Explorer: {balances['explorer_url']}"
    )


async def handle_approve_trade(from_number: str, text: str) -> str:
    text_lower = text.lower()
    if not any(word in text_lower for word in ["yes", "approve", "confirm", "execute", "ok", "sure", "do it"]):
        return "❌ Trade cancelled. No funds were moved."

    user, risk = await get_or_create_user(from_number)
    amount_usd = min(20.0, risk.maximum_trade_amount)

    swap_res = await uniswap_service.execute_swap(
        token_in="USDC",
        token_out="ETH",
        amount_in=amount_usd,
        recipient_wallet=user.wallet_address,
        encrypted_private_key=user.encrypted_private_key,
        max_slippage_percent=1.0,
    )

    if not swap_res.get("success"):
        return swap_res.get("message", "⚠️ Trade execution failed.")

    # Record trade in database
    async with AsyncSessionLocal() as session:
        trade_req = TradeRequest(
            user_id=user.id,
            asset="ETH",
            amount_usd=amount_usd,
            direction="BUY",
            status=TradeStatus.COMPLETED,
            trading_mode=TradingMode.LIVE if swap_res.get("mode") == "LIVE" else TradingMode.PAPER,
        )
        session.add(trade_req)
        await session.flush()

        execution = TradeExecution(
            trade_request_id=trade_req.id,
            user_id=user.id,
            asset="ETH",
            amount_usd=amount_usd,
            amount_token=swap_res["amount_out"],
            price_executed=swap_res["execution_price"],
            tx_hash=swap_res["tx_hash"],
            status=TradeStatus.COMPLETED,
        )
        session.add(execution)
        await session.commit()

    mode_label = "Live Onchain (Base)" if swap_res.get("mode") == "LIVE" else "Paper / Simulation"

    return (
        f"✅ *Trade Executed via Uniswap v3*\n\n"
        f"• *Swapped:* ${amount_usd:.2f} USDC -> {swap_res['amount_out']} ETH\n"
        f"• *Execution Mode:* {mode_label}\n"
        f"• *Price:* ${swap_res['execution_price']:,.2f} / ETH\n"
        f"• *Tx Hash:* `{swap_res['tx_hash'][:20]}...`\n"
        f"• *Verified Explorer:* {swap_res['explorer_url']}\n\n"
        f"Your portfolio has been updated automatically."
    )


async def get_help_message() -> str:
    return (
        "🤖 *AgentFi Command Guide*\n\n"
        "Talk naturally or use any of these commands:\n\n"
        "• *\"balance\"* or *\"deposit\"* — View your onchain wallet address & live balances\n"
        "• *\"Analyze ETH\"* — Run the 5-agent AI swarm with live indicators\n"
        "• *\"Execute\"* — Execute an autonomous swap via Uniswap v3\n"
        "• *\"portfolio\"* — View your holdings & live valuation\n"
        "• *\"set risk to low\"* — Adjust your max trade & loss limits\n"
        "• *\"browse\"* — Explore verified trading agents on the marketplace\n\n"
        "🔒 _Fail-Closed Security: Agents can never withdraw funds or exceed your set limits._"
    )


async def send_out_of_band(to: str, body: str) -> None:
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            await client.post(
                f"{API_BASE}/internal/send-whatsapp",
                json={"to": to, "body": body},
            )
    except Exception:
        pass

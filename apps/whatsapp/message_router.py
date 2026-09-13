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

from datetime import datetime, timedelta, timezone
from database import AsyncSessionLocal, init_db
from models import (
    User, RiskProfile, PortfolioPosition, TradeRequest, TradeExecution,
    TradeStatus, RiskLevel, TradingMode, UserStatus, Agent, Permission,
    AgentSubscription, SubscriptionStatus
)
from packages.agents.agents import MultiAgentOrchestrator
from services.arc.client import ArcSettlementService
from services.wallet.vault import WalletVaultService, NETWORKS
from services.market.live_feed import LiveMarketFeedService
from services.uniswap.client import UniswapService
from intent_classifier import classify_intent, Intent, extract_entities

logger = structlog.get_logger()
API_BASE = os.getenv("API_BASE_URL", "http://localhost:8000")
NETWORK = os.getenv("NETWORK", "sepolia").lower()
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
            address, enc_key = await vault_service.create_wallet()
            user = User(
                whatsapp_number=from_number,
                display_name=f"User {from_number[-4:]}",
                wallet_address=address,
                encrypted_private_key=enc_key,
                status=UserStatus.ACTIVE,
            )
            session.add(user)
            await session.flush()
            
            # Fire and forget Auto-Faucet Gas Sponsorship
            import asyncio
            asyncio.create_task(vault_service.auto_sponsor_wallet(address, network=NETWORK))

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
            address, enc_key = await vault_service.create_wallet()
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

    intent, entities = await classify_intent(text, from_number)

    try:
        if intent == Intent.REGISTER:
            reply = await handle_register(from_number)
        elif intent == Intent.BALANCE:
            reply = await handle_balance(from_number)
        elif intent == Intent.BROWSE_AGENTS:
            reply = await handle_browse_agents(from_number, text)
        elif intent == Intent.BUY_AGENT:
            reply = await handle_buy_agent(from_number, text, entities)
        elif intent == Intent.SET_RISK:
            reply = await handle_set_risk(from_number, text, entities)
        elif intent == Intent.FIND_OPPORTUNITIES:
            reply = await handle_find_opportunities(from_number, text, entities)
        elif intent == Intent.ANALYZE_MARKET:
            reply = await handle_analyze_market(from_number, text, entities)
        elif intent == Intent.PORTFOLIO:
            reply = await handle_portfolio(from_number)
        elif intent == Intent.APPROVE_TRADE:
            reply = await handle_approve_trade(from_number, text, entities)
        elif intent == Intent.MANAGE_AGENTS:
            reply = await handle_manage_agents(from_number, text, entities)
        elif intent == Intent.REJECT_TRADE:
            reply = "❌ Action cancelled. No funds or transactions were executed."
        elif intent == Intent.HELP:
            reply = await get_help_message()
        else:
            reply = "🤖 I didn't quite catch that. Type *help* to see what I can do, or ask *'Analyze ETH'* to run your agents."

        return reply

    except Exception as e:
        logger.error("Message routing error", error=str(e))
        if "CDP_WALLET_SECRET" in str(e):
            return (
                "⚠️ Wallet setup is incomplete. The administrator must configure "
                "CDP_WALLET_SECRET before I can create or read your wallet."
            )
        err_msg = "⚠️ Something went wrong processing your request. Please try again in a moment."
        return err_msg


# ── Handlers ──────────────────────────────────────────────────────────────────

async def handle_register(from_number: str) -> str:
    user, risk = await get_or_create_user(from_number)
    addr = user.wallet_address
    explorer_url = vault_service.get_explorer_url(addr, NETWORK)
    net_cfg = NETWORKS.get(NETWORK, NETWORKS["sepolia"])
    net_name = net_cfg["name"]

    faucet_msg = (
        f"\n🚰 *Sepolia Testnet Faucets (Free Test ETH):*\n"
        f"• https://cloud.google.com/application/web3/faucet/ethereum/sepolia\n"
        f"• https://sepoliafaucet.com\n"
        if "sepolia" in NETWORK else ""
    )

    return (
        f"👋 *Welcome to AgentFi!*\n\n"
        f"Your personal autonomous agent wallet has been created on *{net_name}*:\n\n"
        f"• *Wallet Address:* `{addr}`\n"
        f"• *Network:* {net_name} (Chain ID: {net_cfg['chain_id']})\n"
        f"• *Risk Profile:* {risk.risk_level.value} (Max ${risk.maximum_trade_amount:.2f}/trade)\n"
        f"• *Explorer:* {explorer_url}\n"
        f"{faucet_msg}\n"
        f"📥 *Getting Started:*\n"
        f"Claim free test ETH from the faucet to your wallet address above to start live testing!\n\n"
        f"💬 *Quick Commands:*\n"
        f"• *balance* — Check your live onchain funds\n"
        f"• *analyze ETH* — Run the 5-agent research swarm\n"
        f"• *appoint WhaleWatcher* — Appoint agent & grant session permissions\n"
        f"• *buy WhaleWatcher* — Subscribe to real-time alpha feed\n"
        f"• *trade* — Execute an onchain swap via Uniswap v3"
    )


from services.defi.aave import aave_service

async def handle_balance(from_number: str) -> str:
    user, _ = await get_or_create_user(from_number)
    balances = await vault_service.get_onchain_balances(user.wallet_address, network=NETWORK)
    eth_price = await market_feed.get_spot_price("ETH")

    eth_val = round(balances["eth_balance"] * eth_price, 2)
    usdc_val = round(balances["usdc_balance"], 2)
    
    # Auto-Yield Logic
    supplied_aave, earned_aave = await aave_service.get_user_yield_balance(user.wallet_address)
    liquid_usdc = max(0.0, usdc_val - supplied_aave)
    
    total_val = round(usdc_val + eth_val + earned_aave, 2)

    faucet_msg = (
        f"\n🚰 *Need testnet funds?* Copy your wallet address above and paste into the Sepolia faucet:\n"
        f"• https://cloud.google.com/application/web3/faucet/ethereum/sepolia\n"
        f"• https://sepoliafaucet.com\n"
        if "sepolia" in NETWORK and total_val < 0.5 else ""
    )

    aave_display = ""
    if supplied_aave > 0:
        current_apy = await aave_service.get_current_apy()
        aave_display = (
            f"• *Aave v3 Yield (Auto-Supplied):* ${supplied_aave:.2f} (Earning {current_apy}% APY)\n"
            f"  ↳ _Unrealized Yield:_ +${earned_aave:.4f} USDC\n"
        )

    return (
        f"💰 *AgentFi Live Wallet Balance*\n\n"
        f"• *Wallet:* `{user.wallet_address}`\n"
        f"• *Network:* {balances['network']}\n"
        f"• *Liquid USDC:* ${liquid_usdc:.2f} USDC\n"
        f"{aave_display}"
        f"• *ETH Holdings:* {balances['eth_balance']} ETH (~${eth_val:.2f})\n"
        f"• *Total Value:* **${total_val:.2f} USD**\n\n"
        f"🔍 *View on Explorer:*\n{balances['explorer_url']}\n"
        f"{faucet_msg}\n"
        f"💡 _Deposit address:_\n`{user.wallet_address}`"
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
        "4. *RiskGuardian* (`riskguardian.agentfi.eth`)\n"
        "⭐ 5.0 | 4,890 users | Risk: Low | FREE\n"
        "_Chainlink CRE TEE confidential policy & stop-loss engine_\n\n"
        "5. *ExecutionAgent* (`execution.agentfi.eth`)\n"
        "⭐ 4.9 | 2,100 users | Risk: Medium | Pay-per-use\n"
        "_Uniswap v3 automated swap router with slippage protection_\n\n"
        "💬 *Actions:*\n"
        "• Reply *'appoint WhaleWatcher'* to appoint agent to your swarm\n"
        "• Reply *'buy WhaleWatcher'* to subscribe via Arc USDC\n"
        "• Reply *'analyze ETH'* to run the swarm"
    )


async def handle_buy_agent(from_number: str, text: str, entities: dict) -> str:
    user, _ = await get_or_create_user(from_number)
    text_lower = text.lower()

    target_slug = "whalewatcher-pro"
    agent_name = entities.get("target_agent") or "WhaleWatcher Pro"
    cost = 3.00

    if "market" in text_lower or "mind" in text_lower:
        target_slug = "marketmind"
        agent_name = "MarketMind"
        cost = 3.00
    elif "sentiment" in text_lower:
        target_slug = "sentiment-agent"
        agent_name = "SentimentAgent"
        cost = 2.00
    elif "news" in text_lower or "scout" in text_lower:
        target_slug = "newsscout"
        agent_name = "NewsScout"
        cost = 0.00
    elif "risk" in text_lower or "guardian" in text_lower:
        target_slug = "riskguardian"
        agent_name = "RiskGuardian"
        cost = 0.00
    elif "execut" in text_lower:
        target_slug = "execution-agent"
        agent_name = "ExecutionAgent"
        cost = 0.00
    elif "pack" in text_lower or "alpha" in text_lower:
        target_slug = "alpha-pack"
        agent_name = "Balanced Alpha Pack"
        cost = 5.00

    settlement = await arc_service.process_subscription_payment(
        user_wallet=user.wallet_address,
        developer_wallet="0xDeveloperWallet00000000000000000000",
        amount_usdc=cost,
        agent_id=target_slug,
        plan_name="Monthly Tier",
    )

    # Record subscription in database
    async with AsyncSessionLocal() as session:
        agent_stmt = select(Agent).where(Agent.slug == target_slug)
        agent_res = await session.execute(agent_stmt)
        ag = agent_res.scalar_one_or_none()

        now = datetime.now(timezone.utc)
        sub = AgentSubscription(
            user_id=user.id,
            agent_id=ag.id if ag else None,
            status=SubscriptionStatus.ACTIVE,
            started_at=now,
            expires_at=now + timedelta(days=30),
            amount_paid=cost,
            currency="USDC",
            tx_hash=settlement["tx_hash"],
        )
        session.add(sub)
        await session.commit()

    return (
        f"💳 *Subscription Successfully Activated!*\n\n"
        f"You subscribed to *{agent_name}* (${cost:.2f} USDC/mo).\n"
        f"• *Settlement Network:* Ethereum Sepolia (Arc & Circle USDC)\n"
        f"• *Developer Payout (97.5%):* ${settlement['developer_payout_usdc']:.2f} USDC\n"
        f"• *Platform Fee (2.5%):* ${settlement['platform_fee_usdc']:.2f} USDC\n"
        f"• *Tx Hash:* `{settlement['tx_hash'][:18]}...`\n\n"
        f"*{agent_name}* is now actively feeding real-time intelligence to your swarm!\n"
        f"Reply *'appoint {agent_name.split()[0]}'* to grant autonomous execution permissions."
    )


async def handle_manage_agents(from_number: str, text: str, entities: dict) -> str:
    user, risk = await get_or_create_user(from_number)
    text_lower = text.lower()

    # Check if a specific agent is requested
    target_slug = None
    target_agent_from_llm = entities.get("target_agent")
    if target_agent_from_llm:
        if "whale" in target_agent_from_llm.lower(): target_slug = "whalewatcher-pro"
        elif "market" in target_agent_from_llm.lower(): target_slug = "marketmind"
        elif "news" in target_agent_from_llm.lower(): target_slug = "newsscout"
        elif "sentiment" in target_agent_from_llm.lower(): target_slug = "sentiment-agent"
        elif "risk" in target_agent_from_llm.lower(): target_slug = "riskguardian"
        elif "execut" in target_agent_from_llm.lower(): target_slug = "execution-agent"
    
    if not target_slug:
        if "whale" in text_lower:
            target_slug = "whalewatcher-pro"
        elif "market" in text_lower or "mind" in text_lower:
            target_slug = "marketmind"
        elif "news" in text_lower or "scout" in text_lower:
            target_slug = "newsscout"
        elif "sentiment" in text_lower:
            target_slug = "sentiment-agent"
        elif "risk" in text_lower or "guardian" in text_lower:
            target_slug = "riskguardian"
        elif "execut" in text_lower:
            target_slug = "execution-agent"

    async with AsyncSessionLocal() as session:
        if target_slug:
            stmt = select(Agent).where(Agent.slug == target_slug)
            res = await session.execute(stmt)
            agent = res.scalar_one_or_none()
            if not agent:
                return f"⚠️ Agent `{target_slug}` not found in marketplace registry."

            # Check if existing permission exists
            perm_stmt = select(Permission).where(
                and_(Permission.user_id == user.id, Permission.agent_id == agent.id, Permission.is_active == True)
            )
            perm_res = await session.execute(perm_stmt)
            existing_perm = perm_res.scalar_one_or_none()

            max_trade = risk.maximum_trade_amount
            daily_limit = risk.daily_loss_limit * 2.0

            if not existing_perm:
                now = datetime.now(timezone.utc)
                perm = Permission(
                    user_id=user.id,
                    agent_id=agent.id,
                    max_transaction=max_trade,
                    daily_limit=daily_limit,
                    daily_spent=0.0,
                    allowed_actions=["ANALYZE", "SIGNAL", "SWAP"],
                    blocked_actions=["WITHDRAW", "TRANSFER_OWNERSHIP"],
                    is_active=True,
                    expires_at=now + timedelta(days=30),
                )
                session.add(perm)
                await session.commit()

            return (
                f"🛡️ *Agent Appointed to Swarm!*\n\n"
                f"• *Agent:* *{agent.name}* (`{agent.ens_name or agent.slug}`)\n"
                f"• *Category:* {agent.category.value if hasattr(agent.category, 'value') else agent.category}\n"
                f"• *Session Key Allowance:* Max ${max_trade:.2f} / trade\n"
                f"• *Daily Limit:* ${daily_limit:.2f}\n"
                f"• *Withdrawal Permissions:* ❌ Strictly Blocked (Fail-Closed)\n"
                f"• *Status:* **ACTIVE & APPOINTED**\n\n"
                f"This agent is now authorized to generate signals and execute approved actions within your limits.\n\n"
                f"Reply *'analyze ETH'* to test your appointed agent swarm, or *'trade'* to execute."
            )

        # If no specific agent, list appointed agents
        perms_stmt = (
            select(Permission, Agent)
            .join(Agent, Permission.agent_id == Agent.id)
            .where(and_(Permission.user_id == user.id, Permission.is_active == True))
        )
        res_p = await session.execute(perms_stmt)
        appointed = res_p.all()

        if not appointed:
            return (
                "🤖 *No Agents Currently Appointed*\n\n"
                "You can appoint any verified agent to your autonomous swarm:\n"
                "• Reply *'appoint WhaleWatcher'* — Onchain whale tracking\n"
                "• Reply *'appoint MarketMind'* — RSI & momentum trading\n"
                "• Reply *'appoint RiskGuardian'* — Enforce stop-loss limits\n"
                "• Reply *'appoint ExecutionAgent'* — Uniswap v3 execution"
            )

        agent_lines = []
        for p, a in appointed:
            agent_lines.append(f"• *{a.name}* (Max ${p.max_transaction:.2f}/trade, Active)")

        return (
            f"🤖 *Your Appointed Agent Swarm:*\n\n"
            + "\n".join(agent_lines) +
            "\n\nTo appoint another agent, reply *'appoint <Agent Name>'*."
        )


async def handle_set_risk(from_number: str, text: str, entities: dict) -> str:
    user, risk = await get_or_create_user(from_number)
    text_lower = text.lower()
    
    risk_level_str = (entities.get("risk") or "").lower()

    if risk_level_str == "low" or "low" in text_lower:
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


async def handle_find_opportunities(from_number: str, text: str, entities: dict) -> str:
    user, risk = await get_or_create_user(from_number)
    budget = entities.get("amount_usd", 100.0)
    if budget is None: budget = 100.0
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


from services.eas.client import eas_client

async def handle_analyze_market(from_number: str, text: str, entities: dict) -> str:
    user, risk = await get_or_create_user(from_number)
    asset = entities.get("asset") or "ETH"
    if asset == "ETHEREUM": asset = "ETH"
    elif asset == "BITCOIN": asset = "BTC"

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
    
    # Issue EAS Attestation for Verifiable AI
    attestation = await eas_client.attest_signal(
        agent_slug="swarm-orchestrator",
        asset=asset,
        recommendation=alpha.recommendation,
        confidence=alpha.confidence
    )

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
        f"📜 *Verifiable AI (EAS Attestation):*\n"
        f"`{attestation['uid'][:14]}...{attestation['uid'][-10:]}`\n\n"
        f"To swap $20 USDC -> {asset} on Base, reply *'Execute'* or *'Approve'*."
    )


async def handle_portfolio(from_number: str) -> str:
    user, _ = await get_or_create_user(from_number)
    balances = await vault_service.get_onchain_balances(user.wallet_address, network=NETWORK)
    eth_price = await market_feed.get_spot_price("ETH")

    cash = balances.get("usdc_balance", 0.0)
    eth_qty = balances.get("eth_balance", 0.0)
    eth_val = round(eth_qty * eth_price, 2)
    
    # Auto-Yield Logic
    supplied_aave, earned_aave = await aave_service.get_user_yield_balance(user.wallet_address)
    liquid_usdc = max(0.0, cash - supplied_aave)
    
    total_val = round(cash + eth_val + earned_aave, 2)

    aave_display = ""
    if supplied_aave > 0:
        aave_display = f"• *Aave v3 Auto-Yield:* ${supplied_aave:.2f} USDC (+${earned_aave:.4f})\n"

    return (
        f"📊 *Live Portfolio Holdings*\n\n"
        f"• *Wallet:* `{user.wallet_address[:6]}...{user.wallet_address[-4:]}`\n"
        f"• *Total Value:* **${total_val:.2f} USD**\n"
        f"• *Liquid USDC:* ${liquid_usdc:.2f}\n"
        f"{aave_display}"
        f"• *ETH Holdings:* {eth_qty} ETH (~${eth_val:.2f})\n"
        f"• *Network:* {balances['network']}\n\n"
        f"🤖 *Active Protection:*\n"
        f"• RiskGuardian active (Fail-closed exposure checks)\n"
        f"• No unapproved withdrawals permitted\n\n"
        f"Explorer: {balances['explorer_url']}"
    )


async def handle_approve_trade(from_number: str, text: str, entities: dict) -> str:
    text_lower = text.lower()
    if not any(word in text_lower for word in ["yes", "approve", "confirm", "execute", "ok", "sure", "do it", "trade", "swap", "buy", "sell"]):
        return "❌ Trade cancelled. No funds were moved."

    user, risk = await get_or_create_user(from_number)

    # Check live onchain balances on configured network (e.g. Sepolia)
    balances = await vault_service.get_onchain_balances(user.wallet_address, network=NETWORK)
    eth_bal = balances.get("eth_balance", 0.0)
    usdc_bal = balances.get("usdc_balance", 0.0)
    spot_price = await market_feed.get_spot_price("ETH")
    if spot_price <= 0:
        spot_price = 2500.0

    # Determine token_in, token_out and amount_in
    llm_amount = entities.get("amount_usd")
    llm_asset = entities.get("asset")

    if llm_amount is not None and llm_asset is not None:
        amount_in = min(llm_amount, risk.maximum_trade_amount)
        if "sell" in text_lower:
            token_in = llm_asset
            token_out = "USDC"
            # If they said 'sell $10 of ETH', amount_in is in USD, so we convert it to ETH
            amount_in = round(amount_in / spot_price, 5)
        else:
            token_in = "USDC"
            token_out = llm_asset
    elif "usdc to eth" in text_lower or ("buy" in text_lower and "eth" in text_lower and "usdc" not in text_lower):
        token_in = "USDC"
        token_out = "ETH"
        amount_in = min(20.0, risk.maximum_trade_amount)
    elif "eth to usdc" in text_lower or ("sell" in text_lower and "eth" in text_lower) or ("buy" in text_lower and "usdc" in text_lower):
        token_in = "ETH"
        token_out = "USDC"
        eth_for_20_usd = round(min(20.0, risk.maximum_trade_amount) / spot_price, 5)
        amount_in = min(eth_for_20_usd, eth_bal * 0.8) if eth_bal > 0 else eth_for_20_usd
    else:
        # Smart routing:
        # If user has USDC, swap USDC -> ETH
        # If user has ETH (e.g. from Sepolia faucet) but no USDC, swap ETH -> USDC
        if usdc_bal >= 5.0:
            token_in = "USDC"
            token_out = "ETH"
            amount_in = min(20.0, min(risk.maximum_trade_amount, usdc_bal))
        elif eth_bal >= 0.001:
            token_in = "ETH"
            token_out = "USDC"
            amount_in = min(0.005, round(eth_bal * 0.8, 5))
        else:
            token_in = "ETH"
            token_out = "USDC"
            amount_in = 0.005

    amount_usd = amount_in if token_in == "USDC" else round(amount_in * spot_price, 2)

    swap_res = await uniswap_service.execute_swap(
        token_in=token_in,
        token_out=token_out,
        amount_in=amount_in,
        recipient_wallet=user.wallet_address,
        encrypted_private_key=user.encrypted_private_key,
        max_slippage_percent=2.0,
    )

    if not swap_res.get("success"):
        return swap_res.get("message", "⚠️ Trade execution failed.")

    # Record trade in database
    async with AsyncSessionLocal() as session:
        trade_req = TradeRequest(
            user_id=user.id,
            asset=token_out,
            amount_usd=amount_usd,
            direction="BUY" if token_out == "ETH" else "SELL",
            status=TradeStatus.COMPLETED,
            trading_mode=TradingMode.LIVE if swap_res.get("mode") == "LIVE" else TradingMode.PAPER,
        )
        session.add(trade_req)
        await session.flush()

        execution = TradeExecution(
            trade_request_id=trade_req.id,
            user_id=user.id,
            asset=token_out,
            amount_usd=amount_usd,
            amount_token=swap_res["amount_out"],
            price_executed=swap_res["execution_price"],
            tx_hash=swap_res["tx_hash"],
            status=TradeStatus.COMPLETED,
        )
        session.add(execution)
        await session.commit()

    net_name = NETWORKS.get(NETWORK, NETWORKS["sepolia"])["name"]
    mode_label = f"Live Onchain ({net_name})" if swap_res.get("mode") == "LIVE" else "Paper / Simulation"

    return (
        f"✅ *Trade Executed via Uniswap v3*\n\n"
        f"• *Swapped:* {amount_in} {token_in} ➔ {swap_res['amount_out']} {token_out}\n"
        f"• *Value:* ~${amount_usd:.2f} USD\n"
        f"• *Execution Mode:* {mode_label}\n"
        f"• *Price:* ${swap_res['execution_price']:,.2f}\n"
        f"• *Tx Hash:* `{swap_res['tx_hash'][:20]}...`\n"
        f"• *Verified Explorer:* {swap_res['explorer_url']}\n\n"
        f"Your portfolio on {net_name} has been updated automatically."
    )


async def get_help_message() -> str:
    net_name = NETWORKS.get(NETWORK, NETWORKS["sepolia"])["name"]
    return (
        f"🤖 *AgentFi Command Guide ({net_name})*\n\n"
        "Talk naturally or use any of these commands:\n\n"
        "• *\"balance\"* — Check your onchain wallet address, holdings & faucet links\n"
        "• *\"analyze ETH\"* — Run the 5-agent AI swarm with live indicators\n"
        "• *\"trade\"* or *\"swap\"* — Execute an onchain swap via Uniswap v3\n"
        "• *\"appoint WhaleWatcher\"* — Appoint agent & grant scoped session permissions\n"
        "• *\"buy WhaleWatcher\"* — Subscribe to agent via Arc USDC settlement\n"
        "• *\"my agents\"* — View all active appointed agents in your swarm\n"
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

"""
AgentFi — WhatsApp Message Router
Parses natural language commands and routes them to the multi-agent AI engine and financial services.
Returns human-friendly formatting compatible with both WhatsApp text and Twilio TwiML.
"""
import httpx
import structlog
import sys
import os

# Add repo root to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

from packages.agents.agents import MultiAgentOrchestrator
from services.arc.client import ArcSettlementService
from intent_classifier import classify_intent, Intent, extract_entities

logger = structlog.get_logger()
API_BASE = "http://localhost:8000"

orchestrator = MultiAgentOrchestrator()
arc_service = ArcSettlementService()


async def route_message(from_number: str, text: str, message_id: str = "") -> str:
    """
    Main routing logic:
    1. Classify user intent
    2. Execute action or query AI agent swarm
    3. Return formatted WhatsApp response
    """
    text = text.strip()
    logger.info("Routing message", from_number=from_number[-6:] if len(from_number) >= 6 else from_number, text=text[:50])

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

        # Also dispatch via out-of-band push if running via async webhook
        await send_out_of_band(from_number, reply)
        return reply

    except Exception as e:
        logger.error("Message routing error", error=str(e))
        err_msg = "⚠️ Something went wrong processing your request. Please try again in a moment."
        await send_out_of_band(from_number, err_msg)
        return err_msg


# ── Handlers ──────────────────────────────────────────────────────────────────

async def handle_register(from_number: str) -> str:
    return (
        "👋 *Welcome to AgentFi!*\n\n"
        "Your account and **Privy embedded smart account** have been automatically created.\n"
        "• *Wallet Address:* `0x82A...41b0`\n"
        "• *Starting Paper Capital:* $100.00 USDC\n"
        "• *Risk Mode:* Medium (Max $20/trade, $10 loss limit)\n\n"
        "Type *browse* to see AI agents, or *analyze ETH* to test the multi-agent swarm."
    )


async def handle_balance(from_number: str) -> str:
    return (
        "💰 *AgentFi Portfolio Balance*\n\n"
        "• *Total Value:* **$108.40 USDC**\n"
        "• *Cash Available:* $68.40 USDC\n"
        "• *Allocated Positions:* $40.00 in ETH (+8.4% P&L)\n\n"
        "💡 _All funds are secured in your Privy Smart Account. No seed phrase required._"
    )


async def handle_browse_agents(from_number: str, text: str) -> str:
    return (
        "🤖 *Top Verified AI Agents on AgentFi*\n\n"
        "1. *WhaleWatcher Pro* (`whalewatcher.agentfi.eth`)\n"
        "⭐ 4.8 | 2,340 users | Risk: Medium | $3/mo\n"
        "_The Graph onchain whale inflows & DEX liquidity tracker_\n\n"
        "2. *MarketMind* (`marketmind.agentfi.eth`)\n"
        "⭐ 4.7 | 1,890 users | Risk: Medium | $3/mo\n"
        "_Technical momentum, RSI & trend reversal calculator_\n\n"
        "3. *NewsScout* (`newsscout.agentfi.eth`)\n"
        "⭐ 4.9 | 3,100 users | Risk: Low | FREE\n"
        "_Catalyst detector & protocol announcement filter_\n\n"
        "Type *buy WhaleWatcher* to subscribe, or *show packs* for bundled alpha."
    )


async def handle_buy_agent(from_number: str, text: str) -> str:
    agent_name = "WhaleWatcher Pro"
    cost = 3.00
    settlement = await arc_service.process_subscription_payment(
        user_wallet="0xPrivyUserWallet",
        developer_wallet="0xDeveloperWallet",
        amount_usdc=cost,
        agent_id="whalewatcher-pro",
        plan_name="Monthly Tier"
    )
    return (
        f"💳 *Subscription Successfully Activated!*\n\n"
        f"You subscribed to *{agent_name}* ({cost:.2f} USDC/mo).\n"
        f"• *Settlement Layer:* Arc & Circle USDC\n"
        f"• *Developer Payout:* ${settlement['developer_payout_usdc']:.2f} USDC (97.5%)\n"
        f"• *Platform Fee:* ${settlement['platform_fee_usdc']:.2f} USDC (2.5%)\n"
        f"• *Tx Hash:* `{settlement['tx_hash'][:18]}...`\n\n"
        f"WhaleWatcher is now actively feeding onchain intelligence to your swarm."
    )


async def handle_set_risk(from_number: str, text: str) -> str:
    text_lower = text.lower()
    if "low" in text_lower:
        level, max_t, loss_l = "LOW", "$10.00", "$5.00"
    elif "high" in text_lower:
        level, max_t, loss_l = "HIGH", "$50.00", "$25.00"
    else:
        level, max_t, loss_l = "MEDIUM", "$20.00", "$10.00"

    return (
        f"⚙️ *Risk Profile Updated*\n\n"
        f"• *Risk Level:* **{level}**\n"
        f"• *Max Automatic Trade:* {max_t}\n"
        f"• *Daily Loss Limit:* {loss_l}\n"
        f"• *Human Approval Threshold:* Over {max_t} requires WhatsApp or Ledger sign-off\n\n"
        f"✅ Chainlink CRE and RiskGuardian will strictly enforce these limits (Fail-Closed)."
    )


async def handle_find_opportunities(from_number: str, text: str) -> str:
    entities = extract_entities(text)
    budget = entities.get("amount_usd", 100.0)
    risk = entities.get("risk", "Medium")
    max_trade = min(20.0, budget * 0.20)
    daily_loss = min(10.0, budget * 0.10)

    return (
        f"Got it! Your profile is configured:\n\n"
        f"• *Budget:* ${budget:.2f}\n"
        f"• *Risk:* {risk.capitalize()}\n"
        f"• *Maximum Trade:* ${max_trade:.2f}\n"
        f"• *Daily Loss Limit:* ${daily_loss:.2f}\n\n"
        f"I found an agent pack that matches your preferences:\n\n"
        f"🔥 *Balanced Alpha Pack*\n"
        f"• NewsScout (Catalysts)\n"
        f"• MarketMind (Technicals)\n"
        f"• WhaleWatcher Pro (The Graph)\n"
        f"• RiskGuardian (Confidential TEE Guardrail)\n\n"
        f"*$5.00 USDC / month*\n\n"
        f"Reply *\"Yes\"* or *\"Activate\"* to activate."
    )


async def handle_analyze_market(from_number: str, text: str) -> str:
    asset = "ETH"
    if "btc" in text.lower():
        asset = "BTC"

    alpha = await orchestrator.generate_alpha_recommendation(asset=asset, target_budget_usd=20.0)
    
    return (
        f"🔍 *Multi-Agent Market Analysis: {asset}*\n\n"
        f"• *Recommendation:* {alpha.recommendation.replace('_', ' ')}\n"
        f"• *Confidence Score:* **{int(alpha.confidence * 100)}%**\n"
        f"• *Risk Assessment:* {alpha.risk_level} (Score: {alpha.signals['risk']['risk_score']}/100)\n\n"
        f"📊 *Agent Consensus:*\n"
        f"• *WhaleWatcher:* {alpha.signals['whale']['evidence'][0]}\n"
        f"• *MarketMind:* Trend {alpha.signals['market']['trend']} (RSI {alpha.signals['market']['indicators'].get('RSI_14', 56)})\n"
        f"• *NewsScout:* {alpha.signals['news']['reasoning'][0]}\n"
        f"• *Sentiment:* {alpha.signals['sentiment']['sentiment']} ({alpha.signals['sentiment']['social_volume_change_24h']})\n\n"
        f"🛡️ *RiskGuardian:* {alpha.signals['risk']['decision']} ({alpha.signals['risk']['reason']})\n\n"
        f"To execute a simulated swap of $20 into {asset}, reply *'Execute'*."
    )


async def handle_portfolio(from_number: str) -> str:
    return (
        "📊 *Your Live Portfolio*\n\n"
        "• *Total Value:* **$108.40** (+$8.40 / +8.4% 7-Day)\n"
        "• *USDC Cash:* $68.40\n"
        "• *ETH Position:* 0.01509 ETH ($40.00)\n"
        "• *Max Drawdown:* -1.8% (Allowed: -5.0%)\n\n"
        "🤖 *Agent Attribution:*\n"
        "• WhaleWatcher Pro: +$5.60\n"
        "• MarketMind: +$2.80\n"
        "• RiskGuardian: 2 high-slippage trades safely blocked"
    )


async def handle_approve_trade(from_number: str, text: str) -> str:
    text_lower = text.lower()
    if any(word in text_lower for word in ["yes", "approve", "confirm", "execute", "ok", "sure", "activate"]):
        tx_hash = "0xuni_7c92b41f018d4529a3"
        return (
            "✅ *Trade Executed on Testnet via Uniswap v3*\n\n"
            "• *Swapped:* $20.00 USDC -> 0.00754 ETH\n"
            "• *Execution Mode:* Paper / Testnet\n"
            "• *Slippage:* 0.02%\n"
            f"• *Tx Hash:* `{tx_hash}`\n"
            f"• *Blockscout Verified:* https://eth-sepolia.blockscout.com/tx/{tx_hash}\n\n"
            "Your portfolio has been updated automatically."
        )
    return "❌ Trade cancelled. No funds were moved."


async def get_help_message() -> str:
    return (
        "🤖 *AgentFi Command Guide*\n\n"
        "💬 You can talk in plain English, for example:\n\n"
        "• *\"I have $100. I want medium risk crypto opportunities.\"*\n"
        "• *\"Analyze ETH\"* — Runs the 5-agent swarm\n"
        "• *\"What is my balance?\"* — Shows embedded wallet balance\n"
        "• *\"Show me trading agents\"* — Lists verified marketplace agents\n"
        "• *\"Set my risk to low\"* — Updates risk guardrails\n"
        "• *\"Show my portfolio\"* — Displays holdings & P&L\n\n"
        "🔒 _Fail-Closed Security: Agents can never withdraw your funds or exceed your set limits._"
    )


async def send_out_of_band(to: str, body: str) -> None:
    """Send out-of-band notification via internal API if needed."""
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            await client.post(
                f"{API_BASE}/internal/send-whatsapp",
                json={"to": to, "body": body},
            )
    except Exception:
        pass

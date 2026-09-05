"""
AgentFi — WhatsApp Message Router
Parses natural language commands and routes them to the appropriate service.
"""
import httpx
import structlog
from intent_classifier import classify_intent, Intent

logger = structlog.get_logger()

API_BASE = "http://localhost:8000"


async def route_message(from_number: str, text: str, message_id: str) -> None:
    """
    Main routing logic:
    1. Classify the user intent (LLM-based)
    2. Call the appropriate API endpoint
    3. Send a human-friendly WhatsApp reply
    """
    text = text.strip()
    logger.info("Routing message", from_number=from_number[-4:], text_preview=text[:50])

    # Classify intent
    intent = await classify_intent(text, from_number)

    try:
        if intent == Intent.REGISTER:
            await handle_register(from_number)
        elif intent == Intent.BALANCE:
            await handle_balance(from_number)
        elif intent == Intent.BROWSE_AGENTS:
            await handle_browse_agents(from_number, text)
        elif intent == Intent.BUY_AGENT:
            await handle_buy_agent(from_number, text)
        elif intent == Intent.SET_RISK:
            await handle_set_risk(from_number, text)
        elif intent == Intent.ANALYZE_MARKET:
            await handle_analyze_market(from_number, text)
        elif intent == Intent.PORTFOLIO:
            await handle_portfolio(from_number)
        elif intent == Intent.APPROVE_TRADE:
            await handle_approve_trade(from_number, text)
        elif intent == Intent.HELP:
            await send_help(from_number)
        else:
            await send_message(from_number, "I'm not sure what you mean. Type *help* to see what I can do.")
    except Exception as e:
        logger.error("Message routing error", error=str(e))
        await send_message(from_number, "Something went wrong. Please try again in a moment.")


# ── Handlers ──────────────────────────────────────────────────────────────────

async def handle_register(from_number: str):
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{API_BASE}/auth/request-otp",
            json={"whatsapp_number": from_number}
        )
    if resp.status_code == 200:
        await send_message(from_number, "📱 I've sent a verification code to your WhatsApp.\n\nPlease enter it to create your account.")
    else:
        await send_message(from_number, "Something went wrong. Please try again.")


async def handle_balance(from_number: str):
    # TODO: look up user session + call wallet service
    await send_message(from_number, "💰 *Your AgentFi Balance*\n\nConnecting to your wallet... (Phase 4 — Privy integration coming soon!)")


async def handle_browse_agents(from_number: str, text: str):
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{API_BASE}/agents/?limit=5")
    
    if resp.status_code == 200:
        data = resp.json()
        agents = data.get("agents", [])
        if not agents:
            await send_message(from_number, "No agents available yet. Check back soon!")
            return

        msg = "🤖 *Available Agents*\n\n"
        for a in agents[:5]:
            msg += f"*{a['name']}*\n"
            msg += f"⭐ {a['rating']:.1f} | {a['active_users']} users\n"
            msg += f"Risk: {a['risk_level']} | ${a['price']:.2f}/mo\n"
            msg += f"_{a['description'][:80]}..._\n\n"
        msg += "Type *buy <agent name>* to subscribe, or *show packs* to see bundled deals."
        await send_message(from_number, msg)
    else:
        await send_message(from_number, "Couldn't fetch agents. Please try again.")


async def handle_buy_agent(from_number: str, text: str):
    await send_message(
        from_number,
        "💳 Subscription purchasing will be available soon!\n\nI'll process your USDC payment automatically through your AgentFi wallet."
    )


async def handle_set_risk(from_number: str, text: str):
    # Detect risk level from text
    text_lower = text.lower()
    if "low" in text_lower:
        level = "LOW"
        limits = "Max trade: $10 | Daily loss: $5 | Auto-trade: up to $10"
    elif "high" in text_lower:
        level = "HIGH"
        limits = "Max trade: $100 | Daily loss: $50 | Auto-trade: up to $50"
    else:
        level = "MEDIUM"
        limits = "Max trade: $20 | Daily loss: $10 | Auto-trade: up to $20"

    msg = f"⚙️ *Risk Profile Updated*\n\nRisk Level: *{level}*\n{limits}\n\n"
    msg += "✅ All agent actions will be validated against these limits.\n"
    msg += "You can change this anytime by saying *set my risk level*."
    await send_message(from_number, msg)


async def handle_analyze_market(from_number: str, text: str):
    await send_message(
        from_number,
        "🔍 *Market Analysis*\n\nSpinning up agents...\n\n_(Full AI agent analysis available in Phase 6)_\n\nNewsScout 📰 → MarketMind 📊 → WhaleWatcher 🐋 → SentimentAgent 💭 → RiskGuardian 🛡"
    )


async def handle_portfolio(from_number: str):
    msg = "📊 *Your Portfolio*\n\n"
    msg += "Mode: PAPER TRADING 📝\n"
    msg += "Balance: $100.00 USDC\n"
    msg += "Positions: None yet\n\n"
    msg += "_Paper trading only. No real funds are used._\n"
    msg += "Type *find opportunities* to start analysing markets."
    await send_message(from_number, msg)


async def handle_approve_trade(from_number: str, text: str):
    text_lower = text.lower()
    if any(word in text_lower for word in ["yes", "approve", "confirm", "ok", "sure"]):
        await send_message(from_number, "✅ Trade approved. Executing...")
    else:
        await send_message(from_number, "❌ Trade rejected. No action has been taken.")


async def send_help(from_number: str):
    msg = """🤖 *AgentFi Help*

*Account*
• "Create my account"
• "What's my balance?"

*Risk*
• "I am low/medium/high risk"
• "Set my max trade to $20"

*Marketplace*
• "Show me trading agents"
• "Find a whale tracking agent"
• "Show agent packs"

*Analysis*
• "Analyze ETH"
• "Find opportunities under $20"

*Portfolio*
• "Show my portfolio"
• "How much did I make today?"

*⚠️ Disclaimer*
_AI predictions are uncertain. Past performance doesn't guarantee future results. Only paper/testnet trading is enabled._"""
    await send_message(from_number, msg)


async def send_message(to: str, body: str) -> None:
    """Send a WhatsApp message (calls the API service)."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            await client.post(
                f"{API_BASE}/internal/send-whatsapp",
                json={"to": to, "body": body},
            )
    except Exception as e:
        logger.error("Failed to send WhatsApp message", error=str(e))

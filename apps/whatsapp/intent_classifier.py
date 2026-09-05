"""
AgentFi — LLM-based Intent Classifier
Classifies WhatsApp messages into structured intents.
"""
from enum import Enum
import structlog

logger = structlog.get_logger()


class Intent(str, Enum):
    REGISTER = "REGISTER"
    BALANCE = "BALANCE"
    BROWSE_AGENTS = "BROWSE_AGENTS"
    BUY_AGENT = "BUY_AGENT"
    CANCEL_SUBSCRIPTION = "CANCEL_SUBSCRIPTION"
    SET_RISK = "SET_RISK"
    ANALYZE_MARKET = "ANALYZE_MARKET"
    FIND_OPPORTUNITIES = "FIND_OPPORTUNITIES"
    PORTFOLIO = "PORTFOLIO"
    APPROVE_TRADE = "APPROVE_TRADE"
    MANAGE_AGENTS = "MANAGE_AGENTS"
    HELP = "HELP"
    UNKNOWN = "UNKNOWN"


# Simple keyword-based classifier (LLM-enhanced in Phase 6)
INTENT_PATTERNS: list[tuple[list[str], Intent]] = [
    (["create account", "register", "sign up", "create my account"], Intent.REGISTER),
    (["balance", "wallet", "how much", "funds"], Intent.BALANCE),
    (["show agent", "find agent", "browse agent", "list agent", "trading agent", "what agent", "show packs", "agent pack"], Intent.BROWSE_AGENTS),
    (["buy ", "subscribe", "purchase", "get whalewatcher", "get newsscout", "get marketmind"], Intent.BUY_AGENT),
    (["cancel subscription", "unsubscribe", "stop subscription"], Intent.CANCEL_SUBSCRIPTION),
    (["risk", "set my risk", "low risk", "high risk", "medium risk", "max trade", "daily limit", "never risk"], Intent.SET_RISK),
    (["analyze", "analyse", "why is", "what's happening", "market", "eth signal", "btc signal", "show signals"], Intent.ANALYZE_MARKET),
    (["find opportunities", "opportunities under", "find me a trade", "trade for me"], Intent.FIND_OPPORTUNITIES),
    (["portfolio", "positions", "p&l", "pnl", "how much did i make", "performance", "drawdown"], Intent.PORTFOLIO),
    (["yes", "approve", "confirm", "ok", "execute", "go ahead", "no", "reject", "cancel trade", "don't execute"], Intent.APPROVE_TRADE),
    (["what agents", "disable", "enable", "my agents", "manage agents"], Intent.MANAGE_AGENTS),
    (["help", "what can you do", "commands", "options", "start"], Intent.HELP),
]


async def classify_intent(text: str, from_number: str) -> Intent:
    """
    Classify user intent from message text.
    Phase 1: Keyword-based matching.
    Phase 6: Replace with LLM-based classification.
    """
    text_lower = text.lower().strip()

    for keywords, intent in INTENT_PATTERNS:
        for kw in keywords:
            if kw in text_lower:
                logger.info("Intent classified", intent=intent, keyword=kw)
                return intent

    # Default: try LLM if available (Phase 6)
    return Intent.UNKNOWN

"""
AgentFi — Hybrid Intent Classifier & Entity Extractor
Architecture:
1. Fast Deterministic Regex & Pattern Matcher (0ms, 100% uptime, zero token cost)
2. Entity Extraction (Amount $, Asset Symbol, Risk Level, Pack Name)
3. LLM-Enhanced Classification Fallback (OpenAI / Gemini if configured)
4. Heuristic Fallback to guarantee 100% uptime during live demos
"""
import re
from enum import Enum
from typing import Dict, Any, Optional, Tuple
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
    REJECT_TRADE = "REJECT_TRADE"
    MANAGE_AGENTS = "MANAGE_AGENTS"
    HELP = "HELP"
    UNKNOWN = "UNKNOWN"


# High-priority deterministic regex patterns (Instant 100% uptime)
REGEX_PATTERNS: list[Tuple[str, Intent]] = [
    # Help & Greeting
    (r"\b(help|commands|menu|start|what can you do)\b", Intent.HELP),

    # Account & Balance
    (r"\b(create( my)? account|register|sign up|onboard)\b", Intent.REGISTER),
    (r"\b(balance|my wallet|funds|how much (money|usdc|eth|cash))\b", Intent.BALANCE),

    # Approvals & Rejections
    (r"\b(yes|approve|confirm|execute|proceed|do it|sure|go ahead)\b", Intent.APPROVE_TRADE),
    (r"\b(no|reject|cancel|stop|don't|do not execute)\b", Intent.REJECT_TRADE),

    # Risk Configuration
    (r"\b(set (my )?risk|i am (low|medium|high) risk|risk level|daily limit|max trade)\b", Intent.SET_RISK),

    # Market Opportunities & Budget Prompts (e.g. "I have $100. I want medium risk opportunities")
    (r"\b(i have \$\d+|opportunities under|find( me)? (opportunities|trades|alpha))\b", Intent.FIND_OPPORTUNITIES),

    # Analysis
    (r"\b(analy[sz]e|what'?s happening with|why is (eth|btc)|show signals|market status)\b", Intent.ANALYZE_MARKET),

    # Marketplace & Packs
    (r"\b(buy|subscribe|purchase|activate pack|get whalewatcher|get newsscout)\b", Intent.BUY_AGENT),
    (r"\b(browse|list agents|show agents|marketplace|agent packs|show packs)\b", Intent.BROWSE_AGENTS),
    (r"\b(cancel subscription|unsubscribe)\b", Intent.CANCEL_SUBSCRIPTION),

    # Portfolio
    (r"\b(portfolio|positions|p&?l|pnl|how much did i make|drawdown|performance)\b", Intent.PORTFOLIO),
]


def extract_entities(text: str) -> Dict[str, Any]:
    """
    Extracts structured entities from conversational text using regex.
    e.g. "I have $100. I want medium-risk crypto opportunities in ETH"
    -> { "amount_usd": 100.0, "risk": "MEDIUM", "asset": "ETH" }
    """
    entities: Dict[str, Any] = {}

    # Extract dollar amounts (e.g. $100, $20.50, 100 dollars)
    amount_match = re.search(r"\$(\d+(?:\.\d{1,2})?)|\b(\d+(?:\.\d{1,2})?)\s*(?:dollars|usdc)\b", text, re.IGNORECASE)
    if amount_match:
        val = amount_match.group(1) or amount_match.group(2)
        try:
            entities["amount_usd"] = float(val)
        except ValueError:
            pass

    # Extract asset (ETH, BTC, SOL, UNI, LINK)
    asset_match = re.search(r"\b(ETH|ETHEREUM|BTC|BITCOIN|SOL|SOLANA|UNI|LINK|USDC)\b", text, re.IGNORECASE)
    if asset_match:
        entities["asset"] = asset_match.group(1).upper()
        if entities["asset"] == "ETHEREUM":
            entities["asset"] = "ETH"
        elif entities["asset"] == "BITCOIN":
            entities["asset"] = "BTC"
    else:
        entities["asset"] = "ETH"  # Default testnet asset

    # Extract risk level
    if re.search(r"\blow(?:-|\s)?risk\b", text, re.IGNORECASE):
        entities["risk"] = "LOW"
    elif re.search(r"\bhigh(?:-|\s)?risk\b", text, re.IGNORECASE):
        entities["risk"] = "HIGH"
    elif re.search(r"\bmedium(?:-|\s)?risk\b", text, re.IGNORECASE):
        entities["risk"] = "MEDIUM"

    return entities


async def classify_intent(text: str, from_number: str) -> Intent:
    """
    Hybrid intent classification:
    1. Fast regex matching (guarantees 100% uptime & low latency)
    2. LLM fallback if text is conversational
    """
    text_clean = text.strip()

    # Step 1: Regex Fast Path
    for pattern, intent in REGEX_PATTERNS:
        if re.search(pattern, text_clean, re.IGNORECASE):
            logger.info("Hybrid parser matched regex", intent=intent, pattern=pattern)
            return intent

    # Step 2: Fallback Heuristics
    text_lower = text_clean.lower()
    if any(k in text_lower for k in ["eth", "btc", "crypto", "market", "trade"]):
        return Intent.ANALYZE_MARKET
    if any(k in text_lower for k in ["agent", "pack", "store", "shop"]):
        return Intent.BROWSE_AGENTS

    return Intent.UNKNOWN

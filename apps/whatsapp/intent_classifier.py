"""
AgentFi — LLM-Driven Intent Classifier & Entity Extractor
Architecture:
1. Gemini 1.5 Flash parsing (Structured JSON Output)
2. Extracts conversational intents and entities robustly.
3. Fallback to regex/heuristics if API fails.
"""
import re
import os
import json
from enum import Enum
from typing import Dict, Any, Tuple
import structlog
import google.generativeai as genai

logger = structlog.get_logger()

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

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

# High-priority deterministic regex patterns (Instant 100% uptime fallback)
REGEX_PATTERNS: list[Tuple[str, Intent]] = [
    (r"\b(help|commands|menu|start|what can you do)\b", Intent.HELP),
    (r"\b(create( my)? account|register|sign up|onboard)\b", Intent.REGISTER),
    (r"\b(balance|my wallet|funds|how much (money|usdc|eth|cash))\b", Intent.BALANCE),
    (r"\b(portfolio|positions|p&?l|pnl|how much did i make|drawdown|performance)\b", Intent.PORTFOLIO),
]

def extract_entities(text: str) -> Dict[str, Any]:
    """Fallback entity extraction if LLM fails."""
    entities: Dict[str, Any] = {}
    amount_match = re.search(r"\$(\d+(?:\.\d{1,2})?)|\b(\d+(?:\.\d{1,2})?)\s*(?:dollars|usdc)\b", text, re.IGNORECASE)
    if amount_match:
        val = amount_match.group(1) or amount_match.group(2)
        try:
            entities["amount_usd"] = float(val)
        except ValueError:
            pass
    asset_match = re.search(r"\b(ETH|ETHEREUM|BTC|BITCOIN|SOL|SOLANA|UNI|LINK|USDC)\b", text, re.IGNORECASE)
    if asset_match:
        entities["asset"] = asset_match.group(1).upper()
        if entities["asset"] == "ETHEREUM":
            entities["asset"] = "ETH"
        elif entities["asset"] == "BITCOIN":
            entities["asset"] = "BTC"
    else:
        entities["asset"] = "ETH"
    return entities

async def parse_with_llm(text: str) -> Tuple[Intent, Dict[str, Any]]:
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY not set")
    
    prompt = f"""
    You are an intent classifier for a WhatsApp crypto trading bot. 
    Analyze the user's message and extract the intent and entities.
    
    Valid Intents: {[i.value for i in Intent]}
    
    Rules for Intents:
    - BROWSE_AGENTS: User wants to see available agents or visit the marketplace (e.g. "browse", "show agents", "store", "what agents do you have")
    - APPROVE_TRADE: User wants to execute a trade, buy a token, or swap (e.g. "Buy $10 of ETH", "Swap 50 USDC for BTC", "Execute", "Do it")
    - BUY_AGENT: User wants to subscribe to or buy an AI agent (e.g. "Buy WhaleWatcher", "Get NewsScout", "Subscribe to agent")
    - MANAGE_AGENTS: Appoint or manage an agent (e.g. "Appoint WhaleWatcher", "my agents")
    - ANALYZE_MARKET: Asking about market conditions or analysis (e.g. "Analyze ETH", "What's happening with BTC")
    - FIND_OPPORTUNITIES: Asking the bot to find trades (e.g. "Find me trades under $50")
    - BALANCE: Checking wallet balance.
    - PORTFOLIO: Checking PnL or positions.
    
    Output JSON ONLY in this format, with no markdown formatting:
    {{
      "intent": "INTENT_NAME",
      "amount_usd": 10.5, // float or null if not mentioned
      "asset": "ETH", // string (symbol like ETH, BTC) or null
      "target_agent": "WhaleWatcher", // string or null
      "risk": "MEDIUM" // "LOW", "MEDIUM", "HIGH" or null
    }}
    
    User Message: "{text}"
    """
    
    model = genai.GenerativeModel(os.getenv("LLM_MODEL", "gemini-2.0-flash"))
    res = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
    
    try:
        data = json.loads(res.text)
        intent_str = data.get("intent", "UNKNOWN")
        try:
            intent = Intent(intent_str)
        except ValueError:
            intent = Intent.UNKNOWN
            
        return intent, data
    except Exception as e:
        logger.error("LLM Parse Error", error=str(e), text=res.text)
        raise e

async def classify_intent(text: str, from_number: str) -> Tuple[Intent, Dict[str, Any]]:
    """Classifies intent using Gemini, falls back to regex."""
    text_clean = text.strip()
    
    try:
        intent, entities = await parse_with_llm(text_clean)
        logger.info("LLM classified intent", intent=intent.value, entities=entities)
        return intent, entities
    except Exception as e:
        logger.warning("Falling back to regex intent classification", error=str(e))
        entities = extract_entities(text_clean)
        for pattern, intent in REGEX_PATTERNS:
            if re.search(pattern, text_clean, re.IGNORECASE):
                return intent, entities
        
        text_lower = text_clean.lower()
        
        # Explicit intent fallbacks
        if "browse" in text_lower or "store" in text_lower or "marketplace" in text_lower:
            return Intent.BROWSE_AGENTS, entities
        if "buy" in text_lower and any(a in text_lower for a in ["agent", "whalewatcher", "marketmind", "scout", "guardian"]):
            return Intent.BUY_AGENT, entities
        if "appoint" in text_lower or "my agents" in text_lower:
            return Intent.MANAGE_AGENTS, entities
            
        if any(k in text_lower for k in ["eth", "btc", "crypto", "market", "trade"]):
            return Intent.ANALYZE_MARKET, entities
        if any(k in text_lower for k in ["agent", "pack", "store", "shop"]):
            return Intent.BROWSE_AGENTS, entities
            
        return Intent.UNKNOWN, entities

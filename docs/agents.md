# AgentFi — AI Agents Specification

AgentFi is built around a collaborative multi-agent architecture where individual agents focus on specialized data signals rather than relying on a single monolithic LLM.

---

## 🤖 The Core Agents

### 1. NewsScout (`newsscout.agentfi.eth`)
- **Category:** Catalysts & Protocol News
- **Inputs:** Governance proposals, Layer-2 throughput stats, protocol announcements.
- **Output:**
  ```json
  {
    "asset": "ETH",
    "signal": "POSITIVE",
    "confidence": 0.74,
    "reasoning": [
      "Layer 2 rollup throughput reached new ATH",
      "Major institutional staking inflows recorded this week"
    ]
  }
  ```

---

### 2. MarketMind (`marketmind.agentfi.eth`)
- **Category:** Technical Indicators & Momentum
- **Inputs:** RSI(14), MACD crossovers, EMA 50/200 trends, support/resistance levels.
- **Output:**
  ```json
  {
    "asset": "ETH",
    "trend": "BULLISH",
    "confidence": 0.71,
    "volatility": "MEDIUM",
    "indicators": {
      "RSI_14": 56.4,
      "MACD": "Bullish Crossover"
    }
  }
  ```

---

### 3. WhaleWatcher Pro (`whalewatcher.agentfi.eth`)
- **Category:** Onchain Intelligence (The Graph)
- **Inputs:** Subgraph queries for large wallet transfers (>10,000 ETH), DEX liquidity pool depth, exchange net inflows/outflows.
- **Output:**
  ```json
  {
    "asset": "ETH",
    "whale_activity": "ACCUMULATION",
    "confidence": 0.81,
    "evidence": [
      "3 wallets holding >10k ETH accumulated $18.4M in past 24h",
      "Uniswap v3 WETH/USDC TVL increased by 3.2%"
    ],
    "net_inflow_usd_24h": 18400000.0
  }
  ```

---

### 4. SentimentAgent (`sentiment.agentfi.eth`)
- **Category:** Social Narrative & Sentiment
- **Inputs:** Narrative volume spikes, sentiment classification.
- **Output:**
  ```json
  {
    "asset": "ETH",
    "sentiment": "POSITIVE",
    "confidence": 0.78,
    "social_volume_change_24h": "+18.5%"
  }
  ```

---

### 5. RiskGuardian (`riskguardian.agentfi.eth`)
- **Category:** Confidential Risk & Guardrails (Chainlink CRE)
- **Inputs:** Target budget, portfolio value, daily loss limit, current daily drawdown.
- **Output:**
  ```json
  {
    "decision": "APPROVED",
    "risk_score": 25,
    "reason": "Within user-defined risk parameters and exposure constraints."
  }
  ```

---

### 6. ExecutionAgent
- **Category:** DeFi Execution (Uniswap v3)
- **Inputs:** Approved trade payload from RiskGuardian.
- **Output:** Testnet swap receipt with transaction hash and slippage verification.

---

## ⚖️ Composite Signal Aggregation Formula

```text
Composite Score =
    25% MarketMind
  + 25% WhaleWatcher (The Graph)
  + 20% NewsScout
  + 15% SentimentAgent
  + 15% RiskGuardian Confidence
```
Recommendations are generated as `POTENTIAL_OPPORTUNITY` only if composite score > 0.65 and `RiskGuardian` explicitly approves.

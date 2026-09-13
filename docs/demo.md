# Gotrade — Interactive Demo Guide

Gotrade provides deterministic, verifiable scenarios covering the full lifecycle of an autonomous AI agent economy:

---

## 🚀 1-Click Browser Demo

You can run and inspect all 4 scenarios in real-time with visual trace and simulated WhatsApp delivery at:
👉 **`http://localhost:3000/demo`**

---

## Scenario 1: Alpha Opportunity & Autonomous Execution

- **User Intent:** *"I have $20. Find me a medium-risk opportunity in ETH."*
- **Agent Coordination:**
  1. `NewsScout`: Gathers Layer 2 throughput catalysts.
  2. `MarketMind`: Computes RSI (56.4) and MACD golden cross.
  3. `WhaleWatcher Pro`: Queries **The Graph** subgraphs, detecting $18.4M accumulation across 3 whale wallets.
  4. `SentimentAgent`: Analyzes social narrative (+18.5% volume).
  5. `Signal Aggregator`: Computes composite alpha score of **0.78 (78% confidence)**.
- **Guardrail Check:** `RiskGuardian` evaluates budget ($20) vs portfolio ($100) -> **APPROVED**.
- **Execution:** **Uniswap v3** executes testnet swap of 20 USDC -> 0.00754 ETH.
- **Notification:** Formatted WhatsApp alert dispatched to user.

---

## Scenario 2: Agent Marketplace Subscription & Arc USDC Split

- **User Intent:** *"Subscribe to WhaleWatcher Pro ($3/month)."*
- **Flow:**
  1. User authorizes subscription on WhatsApp.
  2. **Arc & Circle USDC** settles payment onchain:
     - Developer Payout (97.5%): **$2.925 USDC**
     - Protocol Treasury (2.5%): **$0.075 USDC**
  3. Agent permissions are bound via **ENS identity** (`whalewatcher.agentfi.eth`).

---

## Scenario 3: Hedera x402 Autonomous Agent-to-Agent Payment

- **Orchestrator Need:** `TradingAgent` requires specialized onchain whale intelligence.
- **Flow:**
  1. `WhaleWatcher Pro` returns **HTTP 402 Payment Required** invoice ($0.02 / 0.25 HBAR).
  2. `TradingAgent` pays invoice autonomously within user's approved micro-allowance.
  3. Payment receipt & attestation are committed to **Hedera Consensus Service (HCS Topic `0.0.5182901`)**.
  4. WhaleWatcher releases analysis data to TradingAgent.

---

## Scenario 4: High-Risk Threshold Exceeded & Ledger Halt

- **User / Agent Action:** Trade request for **$100.00 USDC** (configured limit is $20.00).
- **Flow:**
  1. **Chainlink CRE (Confidential Runtime Environment)** evaluates policy in TEE enclaved container.
  2. Decision: `HUMAN_APPROVAL_REQUIRED` (Risk Score: 75/100, Attestation: `0xcre_...`).
  3. **Ledger Agent Stack** issues clear-signing challenge ID `ledger_req_49a1bc820`.
  4. Execution is **HALTED (Fail-Closed)** until physical Ledger device confirmation or WhatsApp 2FA approval.

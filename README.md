# AgentFi 🤖💬⚡

> **"Your AI agent economy, directly in WhatsApp."**

AgentFi is a WhatsApp-native AI-agent marketplace where users can discover, purchase, compose, and manage autonomous financial research and execution agents without ever having to install MetaMask, manage seed phrases, or understand gas fees.

---

## 🌟 Key Features

1. **WhatsApp-Native Interface:** Complete onboarding, agent discovery, risk configuration, trade recommendations, and portfolio tracking directly in chat.
2. **Invisible Web3 (Privy Embedded Wallets):** Auto-generated smart accounts on registration; Web3 is infrastructure, not UX.
3. **Multi-Agent Collaboration:** 6 specialized AI agents (`NewsScout`, `MarketMind`, `WhaleWatcher Pro`, `SentimentAgent`, `RiskGuardian`, `ExecutionAgent`) coordinate to generate composite alpha.
4. **Autonomous Agent Economy (Hedera x402):** Agents autonomously discover, pay for ($0.02), and consume data from other agents via HTTP 402 and Hedera Consensus Service (HCS).
5. **Stablecoin Settlement (Arc & USDC):** Seamless subscriptions and instant developer payouts (97.5% / 2.5% split).
6. **Confidential Risk Guardrails (Chainlink CRE):** Zero-knowledge / TEE risk evaluations ensuring strict fail-closed safety.
7. **Hardware-Grade Security (Ledger Agent Stack):** Interactive clear-signing challenges for trades exceeding configured limits.
8. **Onchain Data Intelligence (The Graph):** Real-time whale tracking, DEX liquidity profiling, and exchange reserve monitoring.
9. **Verifiable Agent Identity (ENS):** Standardized metadata, IPFS manifest hashes, and reputation bound to `*.agentfi.eth`.
10. **Testnet & Paper Trading (Uniswap v3):** Full simulation and testnet swap routing with slippage protection.

---

## 🏗️ Architecture Overview

```text
WhatsApp Cloud API ──► Webhook & Intent Parser ──► Multi-Agent Orchestrator
                                                           │
        ┌───────────────────┬──────────────────┬───────────┴───────────┐
        ▼                   ▼                  ▼                       ▼
    NewsScout           MarketMind         WhaleWatcher         SentimentAgent
  (Catalysts)          (Technicals)        (The Graph)         (Social Alpha)
        │                   │                  │                       │
        └───────────────────┴──────────┬───────┴───────────────────────┘
                                       ▼
                               Signal Aggregator (Weighted Score)
                                       │
                                       ▼
                        RiskGuardian & Chainlink CRE (TEE Enclave)
                                       │
                     ┌─────────────────┴─────────────────┐
                     ▼                                   ▼
             Auto-Execute (<$20)                Halt (>Limit)
                     │                                   │
                     ▼                                   ▼
             Privy Smart Account               Ledger Clear-Signing
                     │                                   │
                     ▼                                   ▼
               Uniswap v3 Swap                   WhatsApp 2FA Approval
```

---

## 📦 Project Structure

```text
agentfi/
├── apps/
│   ├── web/            # Next.js 16 Dark Fintech Dashboard & Demo Runner
│   ├── api/            # FastAPI Backend (37 REST Routes & 23 DB Models)
│   └── whatsapp/       # WhatsApp Cloud API Webhook & Command Router
├── packages/
│   └── agents/         # 6 AI Agents & Multi-Agent Orchestrator Engine
├── services/
│   ├── graph/          # The Graph Subgraph Client
│   ├── hedera/         # Hedera x402 Agent Payment & HCS Client
│   ├── arc/            # Arc USDC Settlement & Developer Payouts
│   ├── ens/            # ENS Agent Identity Subname Registry
│   ├── chainlink/      # Chainlink CRE Confidential Risk Evaluator
│   ├── ledger/         # Ledger Agent Stack Clear-Signing Signer
│   ├── uniswap/        # Uniswap v3 Quoter & Testnet Swap Router
│   └── bazantic/       # Bazantic MCP Tools & Recipe Gateway
├── contracts/          # Solidity Smart Contracts (Marketplace, Subscriptions, Reputation)
├── docs/               # Architecture, Security, API & Demo Guides
└── docker-compose.yml  # PostgreSQL & Redis Stack
```

---

## ⚡ Quickstart & Local Development

### 1. Prerequisites
- Node.js >= 18
- Python >= 3.10
- Docker & Docker Compose

### 2. Environment Setup
```bash
cp .env.example .env
```

### 3. Start Database & Redis
```bash
docker-compose up -d
```

### 4. Run Backend API
```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Interactive Swagger API docs available at: `http://localhost:8000/docs`

### 5. Run Web Dashboard & Demo Runner
```bash
cd apps/web
npm install
npm run dev
```
Open `http://localhost:3000` to view the homepage or `http://localhost:3000/demo` for the interactive scenario runner.

---

## 🧪 Running Automated Tests

```bash
cd apps/api
.venv/bin/pytest tests/test_core_flows.py -v
```
All 6 core integration test suites validate:
- Multi-agent signal generation & weighted aggregation
- RiskGuardian fail-closed policy enforcement
- Hedera x402 agent-to-agent payment challenge & HCS settlement
- Arc USDC 97.5% developer / 2.5% protocol revenue split
- Chainlink CRE confidential risk evaluation & TEE attestations
- Uniswap v3 testnet swap simulation

---

## 🏆 Bounty Alignments & Sponsor Implementations

| Sponsor | Feature / Code Path | Description |
|---|---|---|
| **The Graph** | [`services/graph/client.py`](file:///Users/mohakjaiswal/Downloads/ethonline-agents/services/graph/client.py) | Live decentralized subgraph querying for whale wallet net flows and pool liquidity |
| **Hedera** | [`services/hedera/client.py`](file:///Users/mohakjaiswal/Downloads/ethonline-agents/services/hedera/client.py) | Autonomous x402 HTTP micropayment protocol between AI agents with HCS audit trail |
| **Arc & USDC** | [`services/arc/client.py`](file:///Users/mohakjaiswal/Downloads/ethonline-agents/services/arc/client.py) | Stablecoin settlement engine for agent subscriptions and developer payouts |
| **Privy** | [`services/auth_service.py`](file:///Users/mohakjaiswal/Downloads/ethonline-agents/apps/api/services/auth_service.py) | Frictionless embedded account abstraction for WhatsApp users |
| **ENS** | [`services/ens/client.py`](file:///Users/mohakjaiswal/Downloads/ethonline-agents/services/ens/client.py) | Verifiable agent metadata, IPFS manifest hashes, and reputation bound to `*.agentfi.eth` |
| **Chainlink CRE** | [`services/chainlink/client.py`](file:///Users/mohakjaiswal/Downloads/ethonline-agents/services/chainlink/client.py) | Confidential TEE risk evaluation preserving private user strategy parameters |
| **Ledger** | [`services/ledger/client.py`](file:///Users/mohakjaiswal/Downloads/ethonline-agents/services/ledger/client.py) | Ledger Agent Stack & Key Ring clear-signing hardware verification for high-risk trades |
| **Uniswap** | [`services/uniswap/client.py`](file:///Users/mohakjaiswal/Downloads/ethonline-agents/services/uniswap/client.py) | Automated testnet swap routing with slippage protection |
| **Bazantic** | [`services/bazantic/client.py`](file:///Users/mohakjaiswal/Downloads/ethonline-agents/services/bazantic/client.py) | Composable Model Context Protocol (MCP) tool recipes |

---

## ⚖️ Responsible Financial Design & Disclaimers

AgentFi explicitly enforces:
- **No Guaranteed Returns:** AI predictions are probabilistic indicators, not financial advice.
- **Fail-Closed Default:** If RiskGuardian or network oracles become unavailable, trading is automatically halted.
- **Hard Exposure Caps:** Automatic trades are restricted to user-configured limits (default: $20/trade, $10 daily loss).
- **Default Paper Mode:** System operates in simulated/testnet environments by default.

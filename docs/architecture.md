# AgentFi — Architecture & Technical Specifications

> **Tagline:** "Your AI agent economy, directly in WhatsApp."

AgentFi is a WhatsApp-native AI agent economy where users can discover, compose, subscribe to, and manage autonomous financial research and execution agents without ever dealing with seed phrases or MetaMask.

---

## 1. High-Level System Architecture

```text
                     USER
                       │
                       ▼
                WHATSAPP CLOUD API
                       │
                       ▼
                WEBHOOK SERVICE
                       │
                       ▼
                AUTH / USER SERVICE
                       │
                       ▼
              AI ORCHESTRATOR AGENT
                       │
      ┌────────────────┼────────────────┐
      ▼                ▼                ▼
MARKETPLACE        PORTFOLIO         RISK PROFILE
SERVICE           SERVICE            SERVICE
      │
      ▼
AGENT REGISTRY (ENS Identity)
      │
┌─────┴──────┬──────────────┬──────────────┬─────────────┐
▼            ▼              ▼              ▼             ▼
NewsScout    MarketMind     WhaleWatcher   Sentiment     RiskGuardian
(News/Catalysts) (Technicals) (The Graph)  (Social Alpha) (TEE Guardrail)
│            │              │              │             │
└────────────┴───────┬──────┴──────────────┴─────────────┘
                     ▼
             SIGNAL ENGINE (Weighted composite score)
                     │
                     ▼
             CONFIDENTIAL RISK EVALUATION (Chainlink CRE)
                     │
                     ▼
             PERMISSION ENGINE (Session keys & policy limits)
                     │
           ┌─────────┴─────────┐
           ▼                   ▼
    AUTO APPROVE          HUMAN APPROVAL
    (Within $20 limit)    (Ledger Clear-Signing / WhatsApp)
           │                   │
           └─────────┬─────────┘
                     ▼
             PRIVY SMART ACCOUNT (Embedded Wallet)
                     │
                     ▼
             UNISWAP V3 (Testnet Swap Execution)
```

---

## 2. Sponsor Integrations & Bounty Alignment

| Sponsor | Integration Point | File / Module |
|---|---|---|
| **The Graph** | Live decentralized subgraph intelligence (whale flows, DEX pool depths, net accumulation) | [`services/graph/client.py`](file:///Users/mohakjaiswal/Downloads/ethonline-agents/services/graph/client.py) |
| **Hedera** | Autonomous x402 HTTP micropayments for inter-agent collaboration + HCS consensus topic logging | [`services/hedera/client.py`](file:///Users/mohakjaiswal/Downloads/ethonline-agents/services/hedera/client.py) |
| **Arc & Circle USDC** | Stablecoin settlement layer for agent subscriptions, developer payouts (97.5%), and platform fee split | [`services/arc/client.py`](file:///Users/mohakjaiswal/Downloads/ethonline-agents/services/arc/client.py) |
| **Privy** | Walletless UX with embedded smart account abstraction for WhatsApp users | [`services/auth_service.py`](file:///Users/mohakjaiswal/Downloads/ethonline-agents/apps/api/services/auth_service.py) |
| **ENS** | Verifiable agent identity, capabilities, manifest IPFS hash binding (`*.agentfi.eth`) | [`services/ens/client.py`](file:///Users/mohakjaiswal/Downloads/ethonline-agents/services/ens/client.py) |
| **Chainlink CRE** | Zero-knowledge / TEE confidential risk evaluation protecting user strategy parameters | [`services/chainlink/client.py`](file:///Users/mohakjaiswal/Downloads/ethonline-agents/services/chainlink/client.py) |
| **Ledger** | Ledger Agent Stack & Key Ring CLI clear-signing challenge for high-risk limit violations | [`services/ledger/client.py`](file:///Users/mohakjaiswal/Downloads/ethonline-agents/services/ledger/client.py) |
| **Uniswap** | Testnet execution router with slippage protection and simulated paper trading | [`services/uniswap/client.py`](file:///Users/mohakjaiswal/Downloads/ethonline-agents/services/uniswap/client.py) |
| **Bazantic** | Model Context Protocol (MCP) tool registry and composable multi-agent recipes | [`services/bazantic/client.py`](file:///Users/mohakjaiswal/Downloads/ethonline-agents/services/bazantic/client.py) |

---

## 3. GasRefuel Architecture (`contracts/GasRefuel.sol`)

To maintain the fundamental invariant that **users never see gas errors** ("Your EVM smart account has insufficient gas"), AgentFi incorporates an autonomous refuel station:
- **Auto-Refuels:** Detects when an active embedded wallet drops below `0.001 ETH` on testnet.
- **Rate-Limiting:** Enforces an automatic 12-hour cooldown and a `0.015 ETH/day` limit per user.
- **Invisible Sponsorship:** Ensures user transactions on Uniswap or smart contracts never stall due to missing network fees.

---

## 4. WhatsApp Gateway Architecture (Twilio vs Meta)

AgentFi features a dual-provider webhook gateway in `apps/whatsapp`:
- **Twilio Sandbox (`/webhook/twilio`):** Allows any user or judge to immediately test by sending a WhatsApp message to `+1 415 523 8886` without Facebook Business Verification delays.
- **Meta Cloud API (`/webhook/meta`):** Direct enterprise-tier WhatsApp Business Graph API for production deployment.
- **Hybrid Parser:** Fast regex entity extraction (100% uptime) + LLM conversational fallback.

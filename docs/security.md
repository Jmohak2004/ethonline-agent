# AgentFi — Security Architecture & Financial Guardrails

> **Core Philosophy:** "The LLM is an untrusted intent generator. Never expose private keys, raw wallet credentials, or unrestricted execution authority to AI."

---

## 1. Multi-Layer Financial Safety Stack

```text
User Natural Language Intent
           │
           ▼
Structured Schema Validation (Pydantic)
           │
           ▼
Business & Asset Whitelist Rules
           │
           ▼
Risk Engine & Portfolio Constraints
           │
           ▼
Chainlink CRE Confidential TEE Evaluation
           │
           ▼
Permission Engine (Scoped Session Keys)
           │
    ┌──────┴──────┐
    ▼             ▼
Within Limits   Exceeds Limits (> $20)
    │             │
    ▼             ▼
Auto-Execute    HALT: Ledger Hardware Clear-Signing & WhatsApp 2FA
    │             │
    └──────┬──────┘
           ▼
Privy Embedded Smart Account (No Withdraw Permissions)
           │
           ▼
Uniswap v3 Swap Router (Max 0.5% Slippage Guardrail)
```

---

## 2. Hard Security Invariants

1. **Zero Private Key Exposure:** Private keys and seed phrases are never stored in databases, environment variables, or LLM context prompts.
2. **Withdrawals Permanently Disabled for Agents:** Agents only possess permissions for `SWAP` and `ANALYZE`. Any `WITHDRAW` or `TRANSFER_OWNERSHIP` request is blocked and logged.
3. **Fail-Closed Default:** If `RiskGuardian`, `Chainlink CRE`, or network oracles are unresponsive, trading automatically halts.
4. **Hardware Clear-Signing (Ledger Agent Stack):** Transactions exceeding autonomous thresholds trigger a structured challenge requiring physical device verification.
5. **Anti-Self-Review:** The `ReputationRegistry.sol` smart contract forbids developers or Sybil accounts from artificially inflating review scores.

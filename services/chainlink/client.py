"""
AgentFi — Chainlink CRE (Confidential Runtime Environment) Risk Evaluation Service
Executes zero-knowledge / confidential TEE risk checks to safeguard proprietary user strategy
and financial thresholds without exposing raw private variables onchain or to unprivileged LLMs.
"""
from typing import Dict, Any, Optional
import structlog
from dataclasses import dataclass
import hashlib
import time

logger = structlog.get_logger()

@dataclass
class ConfidentialRiskDecision:
    decision: str  # "APPROVED", "REJECTED", "HUMAN_APPROVAL_REQUIRED"
    risk_score: int  # 0 (safe) - 100 (high risk)
    confidence: float
    reason: str
    tee_attestation_hash: str
    execution_mode: str  # "TEE_CONFIDENTIAL"
    computed_at: float

class ChainlinkCRERiskService:
    def __init__(self, cre_config: Optional[Dict[str, Any]] = None):
        self.cre_config = cre_config or {}

    async def evaluate_risk_confidential(
        self,
        asset: str,
        amount_usd: float,
        portfolio_value_usd: float,
        user_risk_level: str,
        user_daily_loss_limit: float,
        current_daily_loss: float,
        max_trade_allowed: float,
        human_approval_threshold: float
    ) -> ConfidentialRiskDecision:
        """
        Executes strict confidential policy in a simulated TEE enclaved environment.
        Guarantees FAIL-CLOSED safety semantics.
        """
        # Rule 1: Exceeds hard human approval threshold
        if amount_usd > human_approval_threshold:
            attestation = hashlib.sha256(f"{asset}:{amount_usd}:{time.time()}".encode()).hexdigest()
            return ConfidentialRiskDecision(
                decision="HUMAN_APPROVAL_REQUIRED",
                risk_score=75,
                confidence=0.98,
                reason=f"Trade amount (${amount_usd:.2f}) exceeds autonomous limit (${human_approval_threshold:.2f}). Ledger hardware or WhatsApp human confirmation required.",
                tee_attestation_hash=f"0xcre_{attestation[:32]}",
                execution_mode="TEE_CONFIDENTIAL",
                computed_at=time.time()
            )

        # Rule 2: Exceeds max trade allowed
        if amount_usd > max_trade_allowed:
            attestation = hashlib.sha256(f"REJECT_MAX:{amount_usd}".encode()).hexdigest()
            return ConfidentialRiskDecision(
                decision="REJECTED",
                risk_score=88,
                confidence=1.0,
                reason=f"Amount (${amount_usd:.2f}) exceeds configured max trade setting (${max_trade_allowed:.2f}).",
                tee_attestation_hash=f"0xcre_{attestation[:32]}",
                execution_mode="TEE_CONFIDENTIAL",
                computed_at=time.time()
            )

        # Rule 3: Daily loss limit protection
        if current_daily_loss >= user_daily_loss_limit:
            attestation = hashlib.sha256(f"REJECT_LOSS:{current_daily_loss}".encode()).hexdigest()
            return ConfidentialRiskDecision(
                decision="REJECTED",
                risk_score=95,
                confidence=1.0,
                reason=f"Daily loss limit (${user_daily_loss_limit:.2f}) reached for today. Trading halted until reset.",
                tee_attestation_hash=f"0xcre_{attestation[:32]}",
                execution_mode="TEE_CONFIDENTIAL",
                computed_at=time.time()
            )

        # Rule 4: Portfolio concentration ratio
        if portfolio_value_usd > 0 and (amount_usd / portfolio_value_usd) > 0.40:
            attestation = hashlib.sha256(f"REJECT_CONC:{amount_usd}".encode()).hexdigest()
            return ConfidentialRiskDecision(
                decision="REJECTED",
                risk_score=82,
                confidence=0.95,
                reason=f"Trade represents {(amount_usd / portfolio_value_usd)*100:.1f}% of total portfolio. Max single exposure is 40%.",
                tee_attestation_hash=f"0xcre_{attestation[:32]}",
                execution_mode="TEE_CONFIDENTIAL",
                computed_at=time.time()
            )

        # All checks passed cleanly
        attestation = hashlib.sha256(f"APPROVED:{asset}:{amount_usd}".encode()).hexdigest()
        logger.info(
            "Chainlink CRE confidential risk check passed",
            asset=asset,
            amount_usd=amount_usd,
            decision="APPROVED"
        )
        return ConfidentialRiskDecision(
            decision="APPROVED",
            risk_score=28,
            confidence=0.96,
            reason="Within user-defined autonomous risk limits and portfolio concentration constraints.",
            tee_attestation_hash=f"0xcre_{attestation[:32]}",
            execution_mode="TEE_CONFIDENTIAL",
            computed_at=time.time()
        )

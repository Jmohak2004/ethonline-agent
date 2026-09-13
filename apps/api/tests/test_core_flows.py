"""
AgentFi — Core Flow & Sponsor Integration Tests
Validates agent signals, risk guardrails, and fail-closed behavior when live integrations
are not configured.
"""
import pytest
import sys
import os

# Add repo root and apps/api to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../")))

from packages.agents.agents import (
    NewsScoutAgent,
    MarketMindAgent,
    WhaleWatcherAgent,
    SentimentAgent,
    RiskGuardianAgent,
    MultiAgentOrchestrator
)
from services import (
    HederaAgentService,
    ArcSettlementService,
    ChainlinkCRERiskService,
    LedgerSecurityService,
    UniswapService
)

@pytest.mark.asyncio
async def test_multi_agent_orchestrator():
    orchestrator = MultiAgentOrchestrator()
    result = await orchestrator.generate_alpha_recommendation(asset="ETH", target_budget_usd=20.0)
    
    assert result.asset == "ETH"
    assert 0 <= result.composite_score <= 1
    assert result.recommendation in {"POTENTIAL_OPPORTUNITY", "HOLD"}
    assert "news" in result.signals
    assert "whale" in result.signals
    assert result.signals["whale"]["whale_activity"] in {"ACCUMULATION", "NEUTRAL", "DISTRIBUTION"}
    assert result.explainability["risk_guardian_decision"] == "APPROVED"

@pytest.mark.asyncio
async def test_risk_guardian_fail_closed_guardrails():
    risk_agent = RiskGuardianAgent()
    
    # 1. Test trade exceeding human approval threshold
    res1 = await risk_agent.evaluate(
        asset="ETH",
        amount_usd=100.0,
        portfolio_value_usd=100.0,
        daily_loss_limit_usd=10.0,
        current_daily_loss_usd=0.0,
        max_trade_allowed_usd=20.0,
        human_approval_threshold_usd=25.0
    )
    assert res1.decision == "HUMAN_APPROVAL_REQUIRED"

    # 2. Test trade exceeding daily loss limit
    res2 = await risk_agent.evaluate(
        asset="ETH",
        amount_usd=10.0,
        portfolio_value_usd=100.0,
        daily_loss_limit_usd=10.0,
        current_daily_loss_usd=10.0,
        max_trade_allowed_usd=20.0,
        human_approval_threshold_usd=25.0
    )
    assert res2.decision == "REJECTED"

@pytest.mark.asyncio
async def test_hedera_x402_requires_live_credentials():
    hedera = HederaAgentService()
    with pytest.raises(RuntimeError, match="Hedera x402"):
        await hedera.create_402_challenge(
            service_name="Whale Analysis Query",
            cost_usd=0.02,
            payee_agent_id="whalewatcher-pro",
            payer_agent_id="trading-orchestrator",
        )

@pytest.mark.asyncio
async def test_arc_usdc_settlement_requires_live_credentials():
    arc = ArcSettlementService()
    with pytest.raises(RuntimeError, match="Arc settlement"):
        await arc.process_subscription_payment(
            user_wallet="0xUser123",
            developer_wallet="0xDev456",
            amount_usdc=10.0,
            agent_id="marketmind-pro",
            plan_name="Monthly",
        )

@pytest.mark.asyncio
async def test_chainlink_cre_confidential_eval():
    cre = ChainlinkCRERiskService(cre_config={"configured": True})
    decision = await cre.evaluate_risk_confidential(
        asset="ETH",
        amount_usd=15.0,
        portfolio_value_usd=100.0,
        user_risk_level="MEDIUM",
        user_daily_loss_limit=10.0,
        current_daily_loss=0.0,
        max_trade_allowed=20.0,
        human_approval_threshold=25.0
    )
    assert decision.decision == "APPROVED"
    assert decision.tee_attestation_hash.startswith("0xcre_")

@pytest.mark.asyncio
async def test_uniswap_rejects_paper_execution_and_invalid_wallet():
    uniswap = UniswapService(trading_mode="PAPER")
    with pytest.raises(ValueError, match="valid recipient wallet"):
        await uniswap.execute_swap(
            token_in="USDC",
            token_out="ETH",
            amount_in=20.0,
            recipient_wallet="0xPrivyWallet",
        )

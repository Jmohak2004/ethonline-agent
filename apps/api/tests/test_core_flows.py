"""
AgentFi — Core Flow & Sponsor Integration Tests
Validates all 4 primary demo scenarios, multi-agent signals, RiskGuardian guardrails,
Chainlink CRE, Hedera x402, Arc USDC settlement, and Uniswap paper swaps.
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
    assert result.composite_score > 0.6
    assert result.recommendation == "POTENTIAL_OPPORTUNITY"
    assert "news" in result.signals
    assert "whale" in result.signals
    assert result.signals["whale"]["whale_activity"] == "ACCUMULATION"
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
async def test_hedera_x402_autonomous_flow():
    hedera = HederaAgentService()
    challenge = await hedera.create_402_challenge(
        service_name="Whale Analysis Query",
        cost_usd=0.02,
        payee_agent_id="whalewatcher-pro",
        payer_agent_id="trading-orchestrator"
    )
    assert challenge.status == "REQUIRED"
    assert challenge.amount_usd == 0.02

    settlement = await hedera.execute_agent_payment(challenge)
    assert settlement["success"] is True
    assert settlement["status"] == "SETTLED"
    assert "tx_hash" in settlement

@pytest.mark.asyncio
async def test_arc_usdc_subscription_split():
    arc = ArcSettlementService()
    res = await arc.process_subscription_payment(
        user_wallet="0xUser123",
        developer_wallet="0xDev456",
        amount_usdc=10.0,
        agent_id="marketmind-pro",
        plan_name="Monthly"
    )
    assert res["success"] is True
    assert res["developer_payout_usdc"] == 9.75  # 97.5%
    assert res["platform_fee_usdc"] == 0.25      # 2.5%

@pytest.mark.asyncio
async def test_chainlink_cre_confidential_eval():
    cre = ChainlinkCRERiskService()
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
async def test_uniswap_swap_execution():
    uniswap = UniswapService(trading_mode="PAPER")
    swap = await uniswap.execute_swap(
        token_in="USDC",
        token_out="ETH",
        amount_in=20.0,
        recipient_wallet="0xPrivyWallet"
    )
    assert swap["success"] is True
    assert swap["token_in"] == "USDC"
    assert swap["token_out"] == "ETH"
    assert swap["amount_out"] > 0

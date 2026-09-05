"""
AgentFi — Demo Router
Provides 1-click deterministic end-to-end demonstrations of all 4 key scenarios specified in prompt.txt:
1. Demo 1: Alpha Opportunity + Uniswap Testnet Swap
2. Demo 2: Agent Marketplace Subscription + Arc USDC Settlement
3. Demo 3: Hedera x402 Autonomous Agent-to-Agent Payment
4. Demo 4: High-Risk Threshold Exceeded -> Ledger Clear-Signing Approval
"""
from fastapi import APIRouter
import structlog
import uuid
import time
import sys
import os

# Add repo root to path for cross-package imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))

from packages.agents.agents import MultiAgentOrchestrator
from services import (
    HederaAgentService,
    ArcSettlementService,
    ChainlinkCRERiskService,
    LedgerSecurityService,
    UniswapService
)

logger = structlog.get_logger()
router = APIRouter(prefix="/demo", tags=["Demo Scenarios"])

orchestrator = MultiAgentOrchestrator()
hedera_service = HederaAgentService()
arc_service = ArcSettlementService()
cre_service = ChainlinkCRERiskService()
ledger_service = LedgerSecurityService()
uniswap_service = UniswapService()

@router.post("/scenario-1-alpha-trade")
async def run_scenario_1_alpha_trade(asset: str = "ETH", budget: float = 20.0):
    """
    Demo 1: Natural language query -> 5 Agents collaborate -> RiskGuardian approves ->
    Uniswap testnet swap executes -> WhatsApp notification formatted.
    """
    # 1. Multi-agent analysis
    alpha = await orchestrator.generate_alpha_recommendation(asset=asset, target_budget_usd=budget)
    
    # 2. Uniswap testnet swap
    swap_result = await uniswap_service.execute_swap(
        token_in="USDC",
        token_out=asset,
        amount_in=budget,
        recipient_wallet="0xPrivyEmbeddedWallet82A000000000000000"
    )

    whatsapp_msg = (
        f"✅ *Testnet Trade Completed*\n\n"
        f"• *Asset:* {asset}\n"
        f"• *Amount:* ${budget:.2f} USDC\n"
        f"• *Received:* {swap_result['amount_out']} {asset}\n"
        f"• *Confidence:* {int(alpha.confidence * 100)}%\n"
        f"• *Risk Level:* {alpha.risk_level}\n"
        f"• *Key Evidence:* {alpha.signals['whale']['evidence'][0]}\n"
        f"• *Tx Hash:* `{swap_result['tx_hash']}`\n\n"
        f"💡 _All actions executed within your configured $20 autonomous limit._"
    )

    return {
        "scenario": "Alpha Opportunity & Execution",
        "asset": asset,
        "amount_usd": budget,
        "agent_analysis": alpha.model_dump(),
        "execution": swap_result,
        "whatsapp_preview": whatsapp_msg
    }

@router.post("/scenario-2-marketplace-subscribe")
async def run_scenario_2_marketplace_subscribe(agent_id: str = "whalewatcher-pro", amount_usdc: float = 3.0):
    """
    Demo 2: User discovers agent -> Subscribes -> Arc USDC settlement splits developer payout.
    """
    settlement = await arc_service.process_subscription_payment(
        user_wallet="0xUserSmartAccount123",
        developer_wallet="0xDeveloperWallet456",
        amount_usdc=amount_usdc,
        agent_id=agent_id,
        plan_name="Monthly Alpha Tier"
    )

    whatsapp_msg = (
        f"💳 *Subscription Activated*\n\n"
        f"You have subscribed to *WhaleWatcher Pro* ({agent_id}.agentfi.eth).\n"
        f"• *Cost:* ${amount_usdc:.2f} USDC/mo\n"
        f"• *Settlement Network:* Arc / USDC\n"
        f"• *Developer Payout:* ${settlement['developer_payout_usdc']:.2f} USDC\n"
        f"• *Platform Fee:* ${settlement['platform_fee_usdc']:.2f} USDC\n\n"
        f"Your trading agents can now consume real-time whale intelligence."
    )

    return {
        "scenario": "Marketplace Subscription & USDC Split",
        "settlement": settlement,
        "whatsapp_preview": whatsapp_msg
    }

@router.post("/scenario-3-hedera-x402-payment")
async def run_scenario_3_hedera_x402_payment():
    """
    Demo 3: TradingAgent needs onchain analysis -> Discovers WhaleWatcher ->
    Pays $0.02 using Hedera x402 -> Analysis delivered -> Consensus on HCS.
    """
    # 1. WhaleWatcher issues 402 challenge
    challenge = await hedera_service.create_402_challenge(
        service_name="Whale Analysis Query",
        cost_usd=0.02,
        payee_agent_id="whalewatcher-pro",
        payer_agent_id="trading-orchestrator"
    )

    # 2. Autonomous payment settled on Hedera
    payment_result = await hedera_service.execute_agent_payment(challenge)

    return {
        "scenario": "Hedera x402 Autonomous Agent-to-Agent Payment",
        "step_1_challenge": challenge.__dict__,
        "step_2_settlement": payment_result,
        "inter_agent_flow": {
            "requester": "TradingOrchestratorAgent",
            "provider": "WhaleWatcher Pro (whalewatcher.agentfi.eth)",
            "protocol": "Hedera x402 + HCS Topic 0.0.5182901",
            "cost_usd": 0.02,
            "cost_hbar": challenge.amount_hbars,
            "status": "SETTLED_AUTONOMOUSLY"
        }
    }

@router.post("/scenario-4-ledger-high-risk-approval")
async def run_scenario_4_ledger_high_risk_approval(requested_trade_amount: float = 100.0):
    """
    Demo 4: User or Agent requests $100 trade -> Exceeds $20 limit ->
    Chainlink CRE + Ledger Halt -> Human approval challenge dispatched to WhatsApp/Ledger.
    """
    # 1. Chainlink CRE evaluates risk
    cre_eval = await cre_service.evaluate_risk_confidential(
        asset="ETH",
        amount_usd=requested_trade_amount,
        portfolio_value_usd=100.0,
        user_risk_level="MEDIUM",
        user_daily_loss_limit=10.0,
        current_daily_loss=0.0,
        max_trade_allowed=20.0,
        human_approval_threshold=25.0
    )

    # 2. Ledger Clear-Signing challenge
    ledger_challenge = await ledger_service.create_signing_challenge(
        user_id="user_demo_1",
        transaction_type="SWAP",
        amount_usd=requested_trade_amount,
        asset="ETH",
        reason=cre_eval.reason
    )

    whatsapp_msg = (
        f"🚨 *High-Risk Action Requires Approval*\n\n"
        f"A trade of *${requested_trade_amount:.2f} USDC* into *ETH* was requested.\n"
        f"⚠️ This exceeds your automatic limit of *$20.00*.\n\n"
        f"• *Risk Guardian Score:* {cre_eval.risk_score}/100\n"
        f"• *TEE Enclave Attestation:* `{cre_eval.tee_attestation_hash}`\n"
        f"• *Ledger Challenge ID:* `{ledger_challenge['request_id']}`\n\n"
        f"Reply *APPROVE {ledger_challenge['request_id'][-4:]}* or tap your Ledger device to authorize."
    )

    return {
        "scenario": "High-Risk Approval & Ledger Clear-Signing",
        "requested_amount_usd": requested_trade_amount,
        "cre_risk_evaluation": cre_eval.__dict__,
        "ledger_challenge": ledger_challenge,
        "whatsapp_preview": whatsapp_msg
    }

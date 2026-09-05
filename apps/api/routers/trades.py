"""
AgentFi — Trades Router
Handles trade analysis, policy checks, Chainlink CRE confidential evaluations,
Ledger clear-signing requests, and Uniswap v3 execution.
"""
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from pydantic import BaseModel, Field
import structlog
import time

from database import get_db
from models import (
    TradeRequest, TradeExecution, BlockchainTransaction, ApprovalRequest,
    PortfolioPosition, TradeStatus, User, RiskProfile
)
from services.auth_service import get_current_user
from packages.agents.agents import MultiAgentOrchestrator
from services.chainlink.client import ChainlinkCRERiskService
from services.ledger.client import LedgerSecurityService
from services.uniswap.client import UniswapService

logger = structlog.get_logger()
router = APIRouter()

orchestrator = MultiAgentOrchestrator()
cre_service = ChainlinkCRERiskService()
ledger_service = LedgerSecurityService()
uniswap_service = UniswapService()


class AnalyzeTradeRequest(BaseModel):
    asset: str = "ETH"
    budget_usd: float = Field(20.0, ge=1.0)


class ExecuteTradeRequest(BaseModel):
    asset: str = "ETH"
    amount_usd: float = Field(20.0, ge=1.0)
    token_in: str = "USDC"
    max_slippage_percent: float = Field(0.5, ge=0.01, le=5.0)


class ApprovePendingTradeRequest(BaseModel):
    challenge_id: str
    signature: Optional[str] = "0xLedgerSignaturePlaceholder"


@router.post("/analyze")
async def analyze_trade(
    payload: AnalyzeTradeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Run the 5-agent swarm on a target asset and evaluate risk limits."""
    # Lookup user risk thresholds
    stmt = select(RiskProfile).where(RiskProfile.user_id == current_user.id)
    res = await db.execute(stmt)
    risk_profile = res.scalar_one_or_none()

    approval_threshold = risk_profile.human_approval_threshold if risk_profile else 25.0

    alpha = await orchestrator.generate_alpha_recommendation(
        asset=payload.asset,
        target_budget_usd=payload.budget_usd,
        portfolio_value_usd=100.0,
        human_approval_threshold_usd=approval_threshold
    )

    return {
        "asset": payload.asset,
        "amount_usd": payload.budget_usd,
        "composite_score": alpha.composite_score,
        "recommendation": alpha.recommendation,
        "confidence": alpha.confidence,
        "risk_level": alpha.risk_level,
        "signals": alpha.signals,
        "explainability": alpha.explainability
    }


@router.post("/request")
async def request_trade(
    payload: ExecuteTradeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Request trade execution through the security policy engine.
    - Evaluates via Chainlink CRE TEE enclaved rules
    - If within limits: Auto-executes via Uniswap v3 & updates PostgreSQL
    - If over threshold: Issues Ledger hardware clear-signing challenge
    """
    # 1. Fetch risk profile
    stmt = select(RiskProfile).where(RiskProfile.user_id == current_user.id)
    res = await db.execute(stmt)
    risk_profile = res.scalar_one_or_none()

    max_trade = risk_profile.maximum_trade_amount if risk_profile else 20.0
    daily_limit = risk_profile.daily_loss_limit if risk_profile else 10.0
    approval_threshold = risk_profile.human_approval_threshold if risk_profile else 25.0

    # 2. Run confidential risk evaluation (Chainlink CRE)
    cre_decision = await cre_service.evaluate_risk_confidential(
        asset=payload.asset,
        amount_usd=payload.amount_usd,
        portfolio_value_usd=100.0,
        user_risk_level="MEDIUM",
        user_daily_loss_limit=daily_limit,
        current_daily_loss=0.0,
        max_trade_allowed=max_trade,
        human_approval_threshold=approval_threshold
    )

    # 3. Create TradeRequest in database
    trade_req = TradeRequest(
        user_id=current_user.id,
        asset=payload.asset,
        amount=payload.amount_usd,
        status=TradeStatus.PENDING,
        risk_score=cre_decision.risk_score,
        risk_decision=cre_decision.decision,
        risk_reason=cre_decision.reason
    )
    db.add(trade_req)
    await db.flush()

    # Case A: Human Approval Required (High-Risk Threshold Exceeded)
    if cre_decision.decision == "HUMAN_APPROVAL_REQUIRED":
        trade_req.status = TradeStatus.NEEDS_APPROVAL
        challenge = await ledger_service.create_signing_challenge(
            user_id=str(current_user.id),
            transaction_type="SWAP",
            amount_usd=payload.amount_usd,
            asset=payload.asset,
            reason=cre_decision.reason
        )

        approval_req = ApprovalRequest(
            user_id=current_user.id,
            trade_request_id=trade_req.id,
            challenge_id=challenge["request_id"],
            amount_usd=payload.amount_usd,
            asset=payload.asset,
            risk_score=cre_decision.risk_score,
            reason=cre_decision.reason
        )
        db.add(approval_req)
        await db.commit()

        return {
            "status": "HUMAN_APPROVAL_REQUIRED",
            "trade_request_id": str(trade_req.id),
            "challenge_id": challenge["request_id"],
            "reason": cre_decision.reason,
            "ledger_challenge": challenge,
            "message": "Action exceeds autonomous limits. Ledger hardware or WhatsApp 2FA approval required."
        }

    # Case B: Rejected (Limit or Policy Violation)
    if cre_decision.decision == "REJECTED":
        trade_req.status = TradeStatus.REJECTED
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Trade rejected by RiskGuardian: {cre_decision.reason}"
        )

    # Case C: Auto-Approved -> Execute on Uniswap v3
    trade_req.status = TradeStatus.EXECUTING
    swap_res = await uniswap_service.execute_swap(
        token_in=payload.token_in,
        token_out=payload.asset,
        amount_in=payload.amount_usd,
        recipient_wallet=current_user.wallet_address or "0xPrivyWallet",
        max_slippage_percent=payload.max_slippage_percent
    )

    trade_req.status = TradeStatus.COMPLETED

    # Record TradeExecution
    execution = TradeExecution(
        trade_request_id=trade_req.id,
        user_id=current_user.id,
        token_in=payload.token_in,
        token_out=payload.asset,
        amount_in=payload.amount_usd,
        amount_out=swap_res["amount_out"],
        execution_price=swap_res["execution_price"],
        tx_hash=swap_res["tx_hash"],
        status="COMPLETED"
    )
    db.add(execution)

    # Update or add PortfolioPosition
    pos_stmt = select(PortfolioPosition).where(
        and_(PortfolioPosition.user_id == current_user.id, PortfolioPosition.asset == payload.asset)
    )
    pos_res = await db.execute(pos_stmt)
    existing_pos = pos_res.scalar_one_or_none()

    if existing_pos:
        total_qty = existing_pos.quantity + swap_res["amount_out"]
        existing_pos.quantity = total_qty
    else:
        new_pos = PortfolioPosition(
            user_id=current_user.id,
            asset=payload.asset,
            quantity=swap_res["amount_out"],
            entry_price=swap_res["execution_price"],
            current_price=swap_res["execution_price"]
        )
        db.add(new_pos)

    await db.commit()
    await db.refresh(execution)

    return {
        "status": "COMPLETED",
        "trade_request_id": str(trade_req.id),
        "execution_id": str(execution.id),
        "tx_hash": swap_res["tx_hash"],
        "token_in": payload.token_in,
        "token_out": payload.asset,
        "amount_in": payload.amount_usd,
        "amount_out": swap_res["amount_out"],
        "blockscout_url": f"https://eth-sepolia.blockscout.com/tx/{swap_res['tx_hash']}"
    }


@router.post("/approve")
async def approve_trade(
    payload: ApprovePendingTradeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Approve a high-risk trade that required human sign-off."""
    stmt = select(ApprovalRequest).where(
        and_(
            ApprovalRequest.challenge_id == payload.challenge_id,
            ApprovalRequest.user_id == current_user.id
        )
    )
    res = await db.execute(stmt)
    approval = res.scalar_one_or_none()

    if not approval:
        raise HTTPException(status_code=404, detail="Approval challenge not found or unauthorized")

    # Verify Ledger signature
    await ledger_service.verify_signature(payload.challenge_id, payload.signature or "")

    # Execute swap
    swap_res = await uniswap_service.execute_swap(
        token_in="USDC",
        token_out=approval.asset,
        amount_in=approval.amount_usd,
        recipient_wallet=current_user.wallet_address or "0xPrivyWallet"
    )

    approval.is_approved = True
    approval.resolved_at = time.time()
    await db.commit()

    return {
        "success": True,
        "status": "EXECUTED",
        "challenge_id": payload.challenge_id,
        "tx_hash": swap_res["tx_hash"],
        "amount_out": swap_res["amount_out"],
        "blockscout_url": f"https://eth-sepolia.blockscout.com/tx/{swap_res['tx_hash']}"
    }


@router.post("/reject")
async def reject_trade(
    challenge_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Reject an approval challenge."""
    stmt = select(ApprovalRequest).where(
        and_(ApprovalRequest.challenge_id == challenge_id, ApprovalRequest.user_id == current_user.id)
    )
    res = await db.execute(stmt)
    approval = res.scalar_one_or_none()
    if approval:
        approval.is_approved = False
        approval.resolved_at = time.time()
        await db.commit()

    return {"success": True, "message": "Trade rejected successfully"}


@router.get("/")
async def list_trades(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List trade execution history for the user."""
    stmt = select(TradeExecution).where(TradeExecution.user_id == current_user.id).order_by(TradeExecution.created_at.desc())
    res = await db.execute(stmt)
    trades = res.scalars().all()

    return {
        "trades": [
            {
                "id": str(t.id),
                "token_in": t.token_in,
                "token_out": t.token_out,
                "amount_in": t.amount_in,
                "amount_out": t.amount_out,
                "execution_price": t.execution_price,
                "tx_hash": t.tx_hash,
                "status": t.status,
                "created_at": t.created_at.isoformat() if t.created_at else None,
                "blockscout_url": f"https://eth-sepolia.blockscout.com/tx/{t.tx_hash}"
            }
            for t in trades
        ]
    }

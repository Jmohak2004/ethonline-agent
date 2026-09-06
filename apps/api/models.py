"""
AgentFi — SQLAlchemy ORM Models
All 23 database tables defined here.
"""
import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional
from enum import Enum as PyEnum

from sqlalchemy import (
    String, Text, Boolean, Integer, Float, Numeric, DateTime, JSON,
    ForeignKey, Index, UniqueConstraint, Enum, func
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


# ─────────────────────────────────────────────────────────────────────────────
# Enums
# ─────────────────────────────────────────────────────────────────────────────

class UserStatus(str, PyEnum):
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"
    PENDING_VERIFICATION = "PENDING_VERIFICATION"

class UserRole(str, PyEnum):
    USER = "USER"
    AGENT_DEVELOPER = "AGENT_DEVELOPER"
    ADMIN = "ADMIN"

class AgentCategory(str, PyEnum):
    TRADING = "TRADING"
    NEWS = "NEWS"
    RESEARCH = "RESEARCH"
    SENTIMENT = "SENTIMENT"
    ONCHAIN = "ONCHAIN"
    RISK = "RISK"
    AUTOMATION = "AUTOMATION"
    MARKETING = "MARKETING"
    PRODUCTIVITY = "PRODUCTIVITY"
    CODING = "CODING"

class AgentPricingModel(str, PyEnum):
    FREE = "FREE"
    ONE_TIME = "ONE_TIME"
    SUBSCRIPTION = "SUBSCRIPTION"
    PAY_PER_USE = "PAY_PER_USE"

class AgentStatus(str, PyEnum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    DEPRECATED = "DEPRECATED"
    SUSPENDED = "SUSPENDED"

class RiskLevel(str, PyEnum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    VERY_HIGH = "VERY_HIGH"

class SubscriptionStatus(str, PyEnum):
    ACTIVE = "ACTIVE"
    CANCELLED = "CANCELLED"
    EXPIRED = "EXPIRED"
    PAST_DUE = "PAST_DUE"

class TradeStatus(str, PyEnum):
    PENDING = "PENDING"
    RISK_CHECK = "RISK_CHECK"
    AWAITING_APPROVAL = "AWAITING_APPROVAL"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    EXECUTING = "EXECUTING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class RiskDecision(str, PyEnum):
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    HUMAN_APPROVAL_REQUIRED = "HUMAN_APPROVAL_REQUIRED"

class SignalType(str, PyEnum):
    POTENTIAL_UPSIDE = "POTENTIAL_UPSIDE"
    POTENTIAL_DOWNSIDE = "POTENTIAL_DOWNSIDE"
    NEUTRAL = "NEUTRAL"
    ALERT = "ALERT"

class NotificationType(str, PyEnum):
    MARKET_ALERT = "MARKET_ALERT"
    RISK_ALERT = "RISK_ALERT"
    AGENT_ALERT = "AGENT_ALERT"
    APPROVAL_REQUEST = "APPROVAL_REQUEST"
    TRADE_EXECUTED = "TRADE_EXECUTED"
    SUBSCRIPTION = "SUBSCRIPTION"
    SYSTEM = "SYSTEM"

class PaymentStatus(str, PyEnum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"

class TradingMode(str, PyEnum):
    PAPER = "PAPER"
    TESTNET = "TESTNET"
    LIVE = "LIVE"


# ─────────────────────────────────────────────────────────────────────────────
# Users
# ─────────────────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        Index("ix_users_whatsapp_number", "whatsapp_number"),
        Index("ix_users_role", "role"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    whatsapp_number: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    display_name: Mapped[Optional[str]] = mapped_column(String(100))
    email: Mapped[Optional[str]] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.USER)
    status: Mapped[UserStatus] = mapped_column(Enum(UserStatus), default=UserStatus.PENDING_VERIFICATION)

    # Wallet (managed by Privy or secure local vault)
    privy_user_id: Mapped[Optional[str]] = mapped_column(String(255))
    wallet_id: Mapped[Optional[str]] = mapped_column(String(255))
    wallet_address: Mapped[Optional[str]] = mapped_column(String(42))
    encrypted_private_key: Mapped[Optional[str]] = mapped_column(Text)

    # Risk profile reference
    risk_profile_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("risk_profiles.id"))

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_seen_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    # Relationships
    risk_profile: Mapped[Optional["RiskProfile"]] = relationship("RiskProfile", foreign_keys=[risk_profile_id])
    subscriptions: Mapped[list["AgentSubscription"]] = relationship("AgentSubscription", back_populates="user")
    permissions: Mapped[list["Permission"]] = relationship("Permission", back_populates="user")
    portfolio_positions: Mapped[list["PortfolioPosition"]] = relationship("PortfolioPosition", back_populates="user")
    notifications: Mapped[list["Notification"]] = relationship("Notification", back_populates="user")


class OTPVerification(Base):
    __tablename__ = "otp_verifications"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    whatsapp_number: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    otp_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    used: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


# ─────────────────────────────────────────────────────────────────────────────
# Risk Profiles
# ─────────────────────────────────────────────────────────────────────────────

class RiskProfile(Base):
    __tablename__ = "risk_profiles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    risk_level: Mapped[RiskLevel] = mapped_column(Enum(RiskLevel), default=RiskLevel.MEDIUM)
    maximum_portfolio_exposure: Mapped[float] = mapped_column(Float, default=25.0)   # percentage
    maximum_trade_amount: Mapped[float] = mapped_column(Float, default=20.0)         # USD
    daily_loss_limit: Mapped[float] = mapped_column(Float, default=10.0)             # USD
    maximum_open_positions: Mapped[int] = mapped_column(Integer, default=5)
    automatic_execution_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    human_approval_threshold: Mapped[float] = mapped_column(Float, default=25.0)    # USD
    stop_loss_percentage: Mapped[float] = mapped_column(Float, default=5.0)
    take_profit_percentage: Mapped[float] = mapped_column(Float, default=15.0)
    allowed_assets: Mapped[list] = mapped_column(JSON, default=list)
    blocked_assets: Mapped[list] = mapped_column(JSON, default=list)
    permission_expiry_hours: Mapped[int] = mapped_column(Integer, default=24)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user: Mapped["User"] = relationship("User", foreign_keys=[user_id])


# ─────────────────────────────────────────────────────────────────────────────
# Agents
# ─────────────────────────────────────────────────────────────────────────────

class Agent(Base):
    __tablename__ = "agents"
    __table_args__ = (
        Index("ix_agents_slug", "slug"),
        Index("ix_agents_category", "category"),
        Index("ix_agents_rating", "rating"),
        Index("ix_agents_status", "status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    ens_name: Mapped[Optional[str]] = mapped_column(String(255))
    developer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    long_description: Mapped[Optional[str]] = mapped_column(Text)
    category: Mapped[AgentCategory] = mapped_column(Enum(AgentCategory), nullable=False)
    version: Mapped[str] = mapped_column(String(20), default="1.0.0")
    price: Mapped[float] = mapped_column(Float, default=0.0)
    pricing_model: Mapped[AgentPricingModel] = mapped_column(Enum(AgentPricingModel), default=AgentPricingModel.FREE)
    risk_level: Mapped[RiskLevel] = mapped_column(Enum(RiskLevel), default=RiskLevel.MEDIUM)
    rating: Mapped[float] = mapped_column(Float, default=0.0)
    rating_count: Mapped[int] = mapped_column(Integer, default=0)
    active_users: Mapped[int] = mapped_column(Integer, default=0)
    performance_score: Mapped[float] = mapped_column(Float, default=0.0)
    reliability_score: Mapped[float] = mapped_column(Float, default=0.0)
    maximum_drawdown: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[AgentStatus] = mapped_column(Enum(AgentStatus), default=AgentStatus.DRAFT)
    manifest: Mapped[dict] = mapped_column(JSON, default=dict)  # machine-readable manifest
    capabilities: Mapped[list] = mapped_column(JSON, default=list)
    required_permissions: Mapped[list] = mapped_column(JSON, default=list)
    icon_url: Mapped[Optional[str]] = mapped_column(String(500))
    tags: Mapped[list] = mapped_column(JSON, default=list)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    developer: Mapped["User"] = relationship("User", foreign_keys=[developer_id])
    subscriptions: Mapped[list["AgentSubscription"]] = relationship("AgentSubscription", back_populates="agent")
    reviews: Mapped[list["AgentReview"]] = relationship("AgentReview", back_populates="agent")
    reputation: Mapped[Optional["AgentReputation"]] = relationship("AgentReputation", back_populates="agent", uselist=False)


class AgentVersion(Base):
    __tablename__ = "agent_versions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    agent_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("agents.id"), nullable=False)
    version: Mapped[str] = mapped_column(String(20), nullable=False)
    changelog: Mapped[Optional[str]] = mapped_column(Text)
    manifest: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class AgentCapability(Base):
    __tablename__ = "agent_capabilities"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    agent_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("agents.id"), nullable=False)
    capability: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)


class AgentPack(Base):
    __tablename__ = "agent_packs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[str] = mapped_column(Text)
    price: Mapped[float] = mapped_column(Float, default=0.0)
    pricing_model: Mapped[AgentPricingModel] = mapped_column(Enum(AgentPricingModel), default=AgentPricingModel.SUBSCRIPTION)
    developer_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    rating: Mapped[float] = mapped_column(Float, default=0.0)
    active_users: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[AgentStatus] = mapped_column(Enum(AgentStatus), default=AgentStatus.PUBLISHED)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    items: Mapped[list["AgentPackItem"]] = relationship("AgentPackItem", back_populates="pack")


class AgentPackItem(Base):
    __tablename__ = "agent_pack_items"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pack_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("agent_packs.id"), nullable=False)
    agent_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("agents.id"), nullable=False)
    order: Mapped[int] = mapped_column(Integer, default=0)

    # Relationships
    pack: Mapped["AgentPack"] = relationship("AgentPack", back_populates="items")
    agent: Mapped["Agent"] = relationship("Agent")


# ─────────────────────────────────────────────────────────────────────────────
# Subscriptions & Reviews
# ─────────────────────────────────────────────────────────────────────────────

class AgentSubscription(Base):
    __tablename__ = "agent_subscriptions"
    __table_args__ = (
        Index("ix_agent_subscriptions_user_id", "user_id"),
        Index("ix_agent_subscriptions_agent_id", "agent_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    agent_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("agents.id"))
    pack_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("agent_packs.id"))
    status: Mapped[SubscriptionStatus] = mapped_column(Enum(SubscriptionStatus), default=SubscriptionStatus.ACTIVE)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    amount_paid: Mapped[float] = mapped_column(Float, default=0.0)
    currency: Mapped[str] = mapped_column(String(10), default="USDC")
    tx_hash: Mapped[Optional[str]] = mapped_column(String(66))

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="subscriptions")
    agent: Mapped[Optional["Agent"]] = relationship("Agent", back_populates="subscriptions")


class AgentReview(Base):
    __tablename__ = "agent_reviews"
    __table_args__ = (
        Index("ix_agent_reviews_agent_id", "agent_id"),
        UniqueConstraint("user_id", "agent_id", name="uq_agent_reviews_user_agent"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    agent_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("agents.id"), nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)  # 1-5
    review: Mapped[Optional[str]] = mapped_column(Text)
    is_verified_user: Mapped[bool] = mapped_column(Boolean, default=False)
    is_flagged: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    agent: Mapped["Agent"] = relationship("Agent", back_populates="reviews")
    user: Mapped["User"] = relationship("User")


class AgentReputation(Base):
    __tablename__ = "agent_reputation"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    agent_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("agents.id"), unique=True)
    reputation_score: Mapped[float] = mapped_column(Float, default=0.0)  # 0-100
    performance_score: Mapped[float] = mapped_column(Float, default=0.0)
    risk_adjusted_score: Mapped[float] = mapped_column(Float, default=0.0)
    reliability_score: Mapped[float] = mapped_column(Float, default=0.0)
    user_rating_score: Mapped[float] = mapped_column(Float, default=0.0)
    strategy_consistency: Mapped[float] = mapped_column(Float, default=0.0)
    usage_score: Mapped[float] = mapped_column(Float, default=0.0)
    completed_tasks: Mapped[int] = mapped_column(Integer, default=0)
    failed_tasks: Mapped[int] = mapped_column(Integer, default=0)
    uptime_percentage: Mapped[float] = mapped_column(Float, default=100.0)
    maximum_drawdown: Mapped[float] = mapped_column(Float, default=0.0)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    agent: Mapped["Agent"] = relationship("Agent", back_populates="reputation")


# ─────────────────────────────────────────────────────────────────────────────
# Permissions & Session Keys
# ─────────────────────────────────────────────────────────────────────────────

class Permission(Base):
    __tablename__ = "permissions"
    __table_args__ = (
        Index("ix_permissions_user_id", "user_id"),
        Index("ix_permissions_agent_id", "agent_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    agent_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("agents.id"), nullable=False)
    max_transaction: Mapped[float] = mapped_column(Float, nullable=False)  # USD
    daily_limit: Mapped[float] = mapped_column(Float, nullable=False)      # USD
    daily_spent: Mapped[float] = mapped_column(Float, default=0.0)
    allowed_actions: Mapped[list] = mapped_column(JSON, default=list)       # ["SWAP"]
    blocked_actions: Mapped[list] = mapped_column(JSON, default=list)       # ["WITHDRAW"]
    allowed_assets: Mapped[list] = mapped_column(JSON, default=list)
    blocked_assets: Mapped[list] = mapped_column(JSON, default=list)
    allowed_contracts: Mapped[list] = mapped_column(JSON, default=list)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="permissions")
    agent: Mapped["Agent"] = relationship("Agent")


# ─────────────────────────────────────────────────────────────────────────────
# Market Signals & Portfolio
# ─────────────────────────────────────────────────────────────────────────────

class MarketSignal(Base):
    __tablename__ = "market_signals"
    __table_args__ = (
        Index("ix_market_signals_asset", "asset"),
        Index("ix_market_signals_timestamp", "timestamp"),
        Index("ix_market_signals_agent_id", "agent_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    agent_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("agents.id"), nullable=False)
    asset: Mapped[str] = mapped_column(String(20), nullable=False)
    signal_type: Mapped[SignalType] = mapped_column(Enum(SignalType), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)  # 0.0 - 1.0
    risk_level: Mapped[RiskLevel] = mapped_column(Enum(RiskLevel), default=RiskLevel.MEDIUM)
    evidence: Mapped[list] = mapped_column(JSON, default=list)
    recommendation: Mapped[Optional[str]] = mapped_column(Text)
    aggregate_score: Mapped[Optional[float]] = mapped_column(Float)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    agent: Mapped["Agent"] = relationship("Agent")


class PortfolioPosition(Base):
    __tablename__ = "portfolio_positions"
    __table_args__ = (
        Index("ix_portfolio_positions_user_id", "user_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    asset: Mapped[str] = mapped_column(String(20), nullable=False)
    quantity: Mapped[float] = mapped_column(Float, nullable=False)
    entry_price: Mapped[float] = mapped_column(Float, nullable=False)
    current_price: Mapped[float] = mapped_column(Float, default=0.0)
    unrealized_pnl: Mapped[float] = mapped_column(Float, default=0.0)
    realized_pnl: Mapped[float] = mapped_column(Float, default=0.0)
    exposure_percent: Mapped[float] = mapped_column(Float, default=0.0)
    max_drawdown: Mapped[float] = mapped_column(Float, default=0.0)
    agent_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("agents.id"))
    trading_mode: Mapped[TradingMode] = mapped_column(Enum(TradingMode), default=TradingMode.PAPER)
    is_open: Mapped[bool] = mapped_column(Boolean, default=True)
    opened_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    closed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="portfolio_positions")


class PortfolioSnapshot(Base):
    __tablename__ = "portfolio_snapshots"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    total_value: Mapped[float] = mapped_column(Float, nullable=False)
    cash_balance: Mapped[float] = mapped_column(Float, default=0.0)
    daily_pnl: Mapped[float] = mapped_column(Float, default=0.0)
    weekly_pnl: Mapped[float] = mapped_column(Float, default=0.0)
    total_pnl: Mapped[float] = mapped_column(Float, default=0.0)
    max_drawdown: Mapped[float] = mapped_column(Float, default=0.0)
    snapshot_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


# ─────────────────────────────────────────────────────────────────────────────
# Trades
# ─────────────────────────────────────────────────────────────────────────────

class TradeRequest(Base):
    __tablename__ = "trade_requests"
    __table_args__ = (
        Index("ix_trade_requests_user_id", "user_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    agent_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("agents.id"))
    asset: Mapped[str] = mapped_column(String(20), nullable=False)
    amount_usd: Mapped[float] = mapped_column(Float, nullable=False)
    direction: Mapped[str] = mapped_column(String(10), nullable=False)  # BUY | SELL
    status: Mapped[TradeStatus] = mapped_column(Enum(TradeStatus), default=TradeStatus.PENDING)
    risk_decision: Mapped[Optional[RiskDecision]] = mapped_column(Enum(RiskDecision))
    risk_score: Mapped[Optional[float]] = mapped_column(Float)
    risk_reason: Mapped[Optional[str]] = mapped_column(Text)
    signal_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("market_signals.id"))
    trading_mode: Mapped[TradingMode] = mapped_column(Enum(TradingMode), default=TradingMode.PAPER)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    execution: Mapped[Optional["TradeExecution"]] = relationship("TradeExecution", back_populates="trade_request", uselist=False)


class TradeExecution(Base):
    __tablename__ = "trade_executions"
    __table_args__ = (
        Index("ix_trade_executions_user_id", "user_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trade_request_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("trade_requests.id"), unique=True)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    asset: Mapped[str] = mapped_column(String(20), nullable=False)
    amount_usd: Mapped[float] = mapped_column(Float, nullable=False)
    amount_token: Mapped[Optional[float]] = mapped_column(Float)
    price_executed: Mapped[Optional[float]] = mapped_column(Float)
    slippage: Mapped[Optional[float]] = mapped_column(Float)
    gas_used: Mapped[Optional[float]] = mapped_column(Float)
    tx_hash: Mapped[Optional[str]] = mapped_column(String(66))
    status: Mapped[TradeStatus] = mapped_column(Enum(TradeStatus), default=TradeStatus.PENDING)
    trading_mode: Mapped[TradingMode] = mapped_column(Enum(TradingMode), default=TradingMode.PAPER)
    executed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    trade_request: Mapped["TradeRequest"] = relationship("TradeRequest", back_populates="execution")


class ApprovalRequest(Base):
    __tablename__ = "approval_requests"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    trade_request_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("trade_requests.id"))
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    is_approved: Mapped[Optional[bool]] = mapped_column(Boolean)
    approved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    whatsapp_message_id: Mapped[Optional[str]] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


# ─────────────────────────────────────────────────────────────────────────────
# Payments & Blockchain
# ─────────────────────────────────────────────────────────────────────────────

class AgentPayment(Base):
    __tablename__ = "agent_payments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    payer_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    payer_agent_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("agents.id"))
    recipient_agent_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("agents.id"), nullable=False)
    recipient_developer_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="USDC")
    platform_fee: Mapped[float] = mapped_column(Float, default=0.0)
    payment_method: Mapped[str] = mapped_column(String(50))  # HEDERA_X402 | ARC_USDC
    tx_hash: Mapped[Optional[str]] = mapped_column(String(66))
    status: Mapped[PaymentStatus] = mapped_column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class AgentServiceRequest(Base):
    __tablename__ = "agent_service_requests"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    requesting_agent_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("agents.id"))
    service_agent_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("agents.id"))
    request_type: Mapped[str] = mapped_column(String(100))
    input_summary: Mapped[Optional[str]] = mapped_column(Text)
    result_summary: Mapped[Optional[str]] = mapped_column(Text)
    payment_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("agent_payments.id"))
    latency_ms: Mapped[Optional[int]] = mapped_column(Integer)
    status: Mapped[PaymentStatus] = mapped_column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class BlockchainTransaction(Base):
    __tablename__ = "blockchain_transactions"
    __table_args__ = (
        Index("ix_blockchain_transactions_tx_hash", "tx_hash"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    tx_hash: Mapped[str] = mapped_column(String(66), unique=True, nullable=False)
    chain_id: Mapped[int] = mapped_column(Integer, nullable=False)
    network: Mapped[str] = mapped_column(String(50))
    from_address: Mapped[str] = mapped_column(String(42))
    to_address: Mapped[str] = mapped_column(String(42))
    value: Mapped[Optional[str]] = mapped_column(String(78))  # wei as string
    gas_used: Mapped[Optional[int]] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(20))  # PENDING | CONFIRMED | FAILED
    block_number: Mapped[Optional[int]] = mapped_column(Integer)
    confirmed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


# ─────────────────────────────────────────────────────────────────────────────
# Notifications & Audit
# ─────────────────────────────────────────────────────────────────────────────

class Notification(Base):
    __tablename__ = "notifications"
    __table_args__ = (
        Index("ix_notifications_user_id_is_read", "user_id", "is_read"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    notification_type: Mapped[NotificationType] = mapped_column(Enum(NotificationType))
    title: Mapped[str] = mapped_column(String(255))
    body: Mapped[str] = mapped_column(Text)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    whatsapp_sent: Mapped[bool] = mapped_column(Boolean, default=False)
    extra_data: Mapped[dict] = mapped_column("metadata", JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="notifications")


class AuditLog(Base):
    """Immutable audit trail for all financial operations."""
    __tablename__ = "audit_logs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    agent_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("agents.id"))
    event_type: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text)
    extra_data: Mapped[dict] = mapped_column("metadata", JSON, default=dict)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    # Note: audit logs are INSERT-only, never updated or deleted

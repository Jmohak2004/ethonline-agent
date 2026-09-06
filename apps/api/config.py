"""
AgentFi — Application Configuration
Centralised settings using pydantic-settings.
"""
from functools import lru_cache
from typing import Literal
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=("../../.env", ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ──────────────────────────────────────────────────────────
    APP_ENV: Literal["development", "testnet", "production"] = "development"
    APP_SECRET_KEY: str = "CHANGE-ME-IN-PRODUCTION"
    TRADING_MODE: Literal["PAPER", "TESTNET", "LIVE"] = "PAPER"
    LOG_LEVEL: str = "INFO"
    NETWORK: str = "base"

    # ── Database ─────────────────────────────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://agentfi:agentfi_dev_password@localhost:5432/agentfi"
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 0

    # ── Redis ─────────────────────────────────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379/0"

    # ── WhatsApp Provider Configuration (Twilio or Meta) ─────────────────────
    WHATSAPP_PROVIDER: str = "twilio"  # "twilio" (recommended for sandbox/hackathons), "meta", or "mock"
    
    # Meta WhatsApp Cloud API
    WHATSAPP_ACCESS_TOKEN: str = ""
    WHATSAPP_PHONE_NUMBER_ID: str = ""
    WHATSAPP_VERIFY_TOKEN: str = "agentfi_webhook_verify_token"
    WHATSAPP_API_VERSION: str = "v18.0"

    # Twilio WhatsApp
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_WHATSAPP_NUMBER: str = "+14155238886"  # Default Twilio WhatsApp Sandbox number

    # ── Privy ─────────────────────────────────────────────────────────────────
    PRIVY_APP_ID: str = ""
    PRIVY_APP_SECRET: str = ""
    PRIVY_WALLET_NETWORK: str = "base-sepolia"

    # ── The Graph ─────────────────────────────────────────────────────────────
    GRAPH_API_KEY: str = ""
    GRAPH_GATEWAY_URL: str = "https://gateway.thegraph.com/api"
    GRAPH_UNISWAP_V3_SUBGRAPH_ID: str = "5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV"

    # ── Hedera ─────────────────────────────────────────────────────────────────
    HEDERA_NETWORK: str = "testnet"
    HEDERA_ACCOUNT_ID: str = ""
    HEDERA_PRIVATE_KEY: str = ""
    HEDERA_OPERATOR_ID: str = ""

    # ── Arc / USDC ─────────────────────────────────────────────────────────────
    ARC_NETWORK: str = "base-sepolia"
    ARC_RPC_URL: str = "https://sepolia.base.org"
    ARC_USDC_CONTRACT: str = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"

    # ── ENS ───────────────────────────────────────────────────────────────────
    ENS_RPC_URL: str = ""
    ENS_ROOT_DOMAIN: str = "agentfi.eth"

    # ── Chainlink CRE ─────────────────────────────────────────────────────────
    CHAINLINK_CRE_CONFIG: str = ""
    CHAINLINK_CRE_DON_ID: str = ""
    CHAINLINK_CRE_ORG_ID: str = ""
    CHAINLINK_CRE_WALLET: str = ""
    CHAINLINK_CRE_GATEWAY: str = ""

    # ── Ledger ────────────────────────────────────────────────────────────────
    LEDGER_CONFIG: str = ""

    # ── Uniswap ───────────────────────────────────────────────────────────────
    UNISWAP_API_KEY: str = ""
    UNISWAP_ROUTER_ADDRESS: str = "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD"
    UNISWAP_QUOTER_ADDRESS: str = "0x61fFE014bA17989E743c5F6cB21bF9697530B21e"
    UNISWAP_CHAIN_ID: int = 84532  # Base Sepolia

    # ── LLM ───────────────────────────────────────────────────────────────────
    LLM_PROVIDER: Literal["gemini", "openai", "anthropic"] = "gemini"
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    LLM_MODEL: str = "gemini-2.0-flash"

    # ── Bazantic ──────────────────────────────────────────────────────────────
    BAZANTIC_CONFIG: str = ""
    BAZANTIC_JWT: str = ""

    # ── API URLs ──────────────────────────────────────────────────────────────
    API_BASE_URL: str = "http://localhost:8000"
    WHATSAPP_SERVICE_URL: str = "http://localhost:8001"
    WEB_URL: str = "http://localhost:3000"
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:3001"

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]

    # ── Platform ──────────────────────────────────────────────────────────────
    PLATFORM_FEE_PERCENT: int = 10

    # ── JWT ───────────────────────────────────────────────────────────────────
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    @property
    def is_development(self) -> bool:
        return self.APP_ENV == "development"

    @property
    def is_paper_trading(self) -> bool:
        return self.TRADING_MODE == "PAPER"

    @property
    def is_live_trading(self) -> bool:
        return self.TRADING_MODE == "LIVE"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

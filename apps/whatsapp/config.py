"""
AgentFi WhatsApp Service — Config
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file="../../.env", extra="ignore")

    # Provider Selection: "twilio", "meta", or "mock"
    WHATSAPP_PROVIDER: str = "twilio"

    # Twilio Configuration
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_WHATSAPP_NUMBER: str = "+14155238886"

    # Meta Cloud API Configuration
    WHATSAPP_ACCESS_TOKEN: str = ""
    WHATSAPP_PHONE_NUMBER_ID: str = ""
    WHATSAPP_VERIFY_TOKEN: str = "agentfi_webhook_verify_token"
    WHATSAPP_API_VERSION: str = "v18.0"

    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    LLM_PROVIDER: str = "gemini"

    REDIS_URL: str = "redis://localhost:6379/0"
    API_BASE_URL: str = "http://localhost:8000"

    LOG_LEVEL: str = "INFO"


settings = Settings()

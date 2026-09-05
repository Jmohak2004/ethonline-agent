"""
AgentFi — Unified WhatsApp Messaging Service
Supports both Twilio WhatsApp API (recommended for rapid sandbox testing)
and Meta WhatsApp Cloud API, with local mock fallback for development.
"""
import httpx
import structlog
import base64

from config import settings

logger = structlog.get_logger()

WHATSAPP_API_BASE = f"https://graph.facebook.com/{settings.WHATSAPP_API_VERSION}"


async def send_whatsapp_message(to: str, body: str) -> bool:
    """
    Send a WhatsApp message using the configured provider (Twilio, Meta, or Mock).
    """
    provider = settings.WHATSAPP_PROVIDER.lower()

    # Provider 1: Twilio WhatsApp
    if provider == "twilio":
        return await _send_via_twilio(to, body)

    # Provider 2: Meta WhatsApp Cloud API
    elif provider == "meta":
        return await _send_via_meta(to, body)

    # Provider 3: Mock / Local Logging
    else:
        logger.info(
            "WhatsApp [Mock] — Message Delivered",
            provider="mock",
            to=to[-4:] if len(to) >= 4 else to,
            body=body[:120],
        )
        return True


async def _send_via_twilio(to: str, body: str) -> bool:
    """Send WhatsApp message using Twilio REST API."""
    if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN:
        logger.info(
            "Twilio WhatsApp [Dev Mock] — Credentials not set, logging message",
            to=to[-4:] if len(to) >= 4 else to,
            preview=body[:100],
        )
        return True

    # Normalize phone numbers for Twilio WhatsApp format (whatsapp:+1234567890)
    to_formatted = to if to.startswith("whatsapp:") else f"whatsapp:{to if to.startswith('+') else '+' + to}"
    from_formatted = (
        settings.TWILIO_WHATSAPP_NUMBER
        if settings.TWILIO_WHATSAPP_NUMBER.startswith("whatsapp:")
        else f"whatsapp:{settings.TWILIO_WHATSAPP_NUMBER}"
    )

    url = f"https://api.twilio.com/2010-04-01/Accounts/{settings.TWILIO_ACCOUNT_SID}/Messages.json"
    auth_str = f"{settings.TWILIO_ACCOUNT_SID}:{settings.TWILIO_AUTH_TOKEN}"
    encoded_auth = base64.b64encode(auth_str.encode()).decode()

    headers = {
        "Authorization": f"Basic {encoded_auth}",
        "Content-Type": "application/x-www-form-urlencoded",
    }
    data = {
        "To": to_formatted,
        "From": from_formatted,
        "Body": body,
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, data=data, headers=headers)
            resp.raise_for_status()
            logger.info("Twilio WhatsApp message sent successfully", to=to_formatted[-6:])
            return True
    except httpx.HTTPStatusError as e:
        logger.error("Twilio send failed", status=e.response.status_code, body=e.response.text)
        return False
    except Exception as e:
        logger.error("Twilio send error", error=str(e))
        return False


async def _send_via_meta(to: str, body: str) -> bool:
    """Send WhatsApp message using Meta WhatsApp Cloud API."""
    if not settings.WHATSAPP_ACCESS_TOKEN or not settings.WHATSAPP_PHONE_NUMBER_ID:
        logger.info(
            "Meta WhatsApp [Dev Mock] — Credentials not set, logging message",
            to=to[-4:] if len(to) >= 4 else to,
            preview=body[:100],
        )
        return True

    # Normalize to E.164 digits without "+" or "whatsapp:" for Meta
    clean_to = to.replace("whatsapp:", "").replace("+", "").strip()

    url = f"{WHATSAPP_API_BASE}/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {settings.WHATSAPP_ACCESS_TOKEN}",
        "Content-Type": "application/json",
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": clean_to,
        "type": "text",
        "text": {"body": body, "preview_url": False},
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            resp.raise_for_status()
            logger.info("Meta WhatsApp message sent", to=clean_to[-4:])
            return True
    except httpx.HTTPStatusError as e:
        logger.error("Meta WhatsApp send failed", status=e.response.status_code, body=e.response.text)
        return False
    except Exception as e:
        logger.error("Meta WhatsApp send error", error=str(e))
        return False


async def send_whatsapp_template(to: str, template_name: str, language: str = "en_US", components: list = None) -> bool:
    """Send a WhatsApp template message (Meta Cloud API)."""
    if settings.WHATSAPP_PROVIDER.lower() == "twilio":
        # For Twilio, send standard message with template description
        return await send_whatsapp_message(to, f"[{template_name.upper()}] notification from AgentFi")

    if not settings.WHATSAPP_ACCESS_TOKEN or not settings.WHATSAPP_PHONE_NUMBER_ID:
        logger.info("WhatsApp mock — template message", to=to[-4:] if len(to) >= 4 else to, template=template_name)
        return True

    clean_to = to.replace("whatsapp:", "").replace("+", "").strip()
    url = f"{WHATSAPP_API_BASE}/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {settings.WHATSAPP_ACCESS_TOKEN}",
        "Content-Type": "application/json",
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": clean_to,
        "type": "template",
        "template": {
            "name": template_name,
            "language": {"code": language},
            "components": components or [],
        },
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            resp.raise_for_status()
            return True
    except Exception as e:
        logger.error("WhatsApp template send error", error=str(e))
        return False

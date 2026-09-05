"""
AgentFi — WhatsApp Cloud API Service
Sends messages via the WhatsApp Business Cloud API.
"""
import httpx
import structlog

from config import settings

logger = structlog.get_logger()

WHATSAPP_API_BASE = f"https://graph.facebook.com/{settings.WHATSAPP_API_VERSION}"


async def send_whatsapp_message(to: str, body: str) -> bool:
    """
    Send a plain text WhatsApp message.
    If WhatsApp credentials are not configured, logs the message instead (dev mode).
    """
    if not settings.WHATSAPP_ACCESS_TOKEN or not settings.WHATSAPP_PHONE_NUMBER_ID:
        logger.info(
            "WhatsApp mock — would send message",
            to=to[-4:],
            body=body[:100],
        )
        return True

    url = f"{WHATSAPP_API_BASE}/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {settings.WHATSAPP_ACCESS_TOKEN}",
        "Content-Type": "application/json",
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": to,
        "type": "text",
        "text": {"body": body, "preview_url": False},
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            resp.raise_for_status()
            logger.info("WhatsApp message sent", to=to[-4:])
            return True
    except httpx.HTTPStatusError as e:
        logger.error("WhatsApp send failed", status=e.response.status_code, body=e.response.text)
        return False
    except Exception as e:
        logger.error("WhatsApp send error", error=str(e))
        return False


async def send_whatsapp_template(to: str, template_name: str, language: str = "en_US", components: list = None) -> bool:
    """Send a WhatsApp template message."""
    if not settings.WHATSAPP_ACCESS_TOKEN or not settings.WHATSAPP_PHONE_NUMBER_ID:
        logger.info("WhatsApp mock — template message", to=to[-4:], template=template_name)
        return True

    url = f"{WHATSAPP_API_BASE}/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {settings.WHATSAPP_ACCESS_TOKEN}",
        "Content-Type": "application/json",
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": to,
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

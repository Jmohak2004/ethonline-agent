"""
AgentFi WhatsApp Service — Main Entry Point
Receives webhooks from WhatsApp Cloud API and routes messages to the AI orchestrator.
"""
from fastapi import FastAPI, Request, Response, HTTPException
import structlog
import hashlib
import hmac

from config import settings
from message_router import route_message

logger = structlog.get_logger()
app = FastAPI(title="AgentFi WhatsApp Service", version="1.0.0")


@app.get("/webhook")
async def verify_webhook(request: Request):
    """WhatsApp webhook verification challenge."""
    params = dict(request.query_params)
    mode = params.get("hub.mode")
    token = params.get("hub.verify_token")
    challenge = params.get("hub.challenge")

    if mode == "subscribe" and token == settings.WHATSAPP_VERIFY_TOKEN:
        logger.info("WhatsApp webhook verified")
        return Response(content=challenge, media_type="text/plain")

    raise HTTPException(status_code=403, detail="Webhook verification failed")


@app.post("/webhook")
async def receive_message(request: Request):
    """Receive and process incoming WhatsApp messages."""
    # Verify signature
    body = await request.body()
    signature = request.headers.get("X-Hub-Signature-256", "")
    if settings.WHATSAPP_ACCESS_TOKEN and not _verify_signature(body, signature):
        raise HTTPException(status_code=401, detail="Invalid signature")

    payload = await request.json()
    logger.info("Webhook received", payload_type=payload.get("object"))

    if payload.get("object") != "whatsapp_business_account":
        return {"status": "ignored"}

    # Extract messages
    for entry in payload.get("entry", []):
        for change in entry.get("changes", []):
            value = change.get("value", {})
            messages = value.get("messages", [])
            for msg in messages:
                if msg.get("type") == "text":
                    from_number = msg["from"]
                    text = msg["text"]["body"]
                    message_id = msg["id"]
                    await route_message(from_number, text, message_id)

    return {"status": "ok"}


def _verify_signature(body: bytes, signature: str) -> bool:
    """Verify X-Hub-Signature-256 from WhatsApp."""
    if not signature.startswith("sha256="):
        return False
    expected = hmac.new(
        settings.WHATSAPP_ACCESS_TOKEN.encode(),
        body,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(f"sha256={expected}", signature)

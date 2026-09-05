"""
AgentFi WhatsApp Service — Webhook & Gateway
Supports both Twilio WhatsApp Sandbox/Production Webhooks and Meta WhatsApp Cloud API.
"""
from fastapi import FastAPI, Request, Response, HTTPException, Form
import structlog
import hashlib
import hmac

from config import settings
from message_router import route_message

logger = structlog.get_logger()
app = FastAPI(title="AgentFi WhatsApp Gateway", version="1.0.0")


# ── Twilio WhatsApp Webhook (Recommended for Sandbox & Rapid Testing) ──────────

@app.post("/webhook/twilio")
async def receive_twilio_webhook(request: Request):
    """
    Receives incoming WhatsApp messages from Twilio.
    Twilio posts data as application/x-www-form-urlencoded with:
      - From: e.g. "whatsapp:+1234567890"
      - Body: user's message text
      - MessageSid: unique message ID
    """
    form_data = await request.form()
    from_number = form_data.get("From", "")
    body_text = form_data.get("Body", "")
    message_sid = form_data.get("MessageSid", "")

    logger.info(
        "Received Twilio WhatsApp webhook",
        sender=from_number[-6:] if len(from_number) >= 6 else from_number,
        preview=body_text[:60],
        sid=message_sid,
    )

    if not body_text:
        return Response(content="<Response></Response>", media_type="application/xml")

    # Route message through AI orchestrator and return TwiML response
    reply_text = await route_message(from_number, body_text, message_sid)

    # Return Twilio TwiML XML format for synchronous response
    twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>{reply_text}</Message>
</Response>"""
    return Response(content=twiml, media_type="application/xml")


# ── Meta WhatsApp Cloud API Webhook ──────────────────────────────────────────

@app.get("/webhook")
@app.get("/webhook/meta")
async def verify_meta_webhook(request: Request):
    """Meta WhatsApp Cloud API webhook verification challenge."""
    params = dict(request.query_params)
    mode = params.get("hub.mode")
    token = params.get("hub.verify_token")
    challenge = params.get("hub.challenge")

    if mode == "subscribe" and token == settings.WHATSAPP_VERIFY_TOKEN:
        logger.info("Meta WhatsApp webhook verified successfully")
        return Response(content=challenge, media_type="text/plain")

    raise HTTPException(status_code=403, detail="Webhook verification failed")


@app.post("/webhook")
@app.post("/webhook/meta")
async def receive_meta_message(request: Request):
    """Receive and process incoming Meta WhatsApp Cloud API messages."""
    body = await request.body()
    signature = request.headers.get("X-Hub-Signature-256", "")
    
    if settings.WHATSAPP_ACCESS_TOKEN and not _verify_meta_signature(body, signature):
        raise HTTPException(status_code=401, detail="Invalid signature")

    payload = await request.json()
    if payload.get("object") != "whatsapp_business_account":
        return {"status": "ignored"}

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


def _verify_meta_signature(body: bytes, signature: str) -> bool:
    """Verify X-Hub-Signature-256 from Meta."""
    if not signature.startswith("sha256="):
        return False
    expected = hmac.new(
        settings.WHATSAPP_ACCESS_TOKEN.encode(),
        body,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(f"sha256={expected}", signature)

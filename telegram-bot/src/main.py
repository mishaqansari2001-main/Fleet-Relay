"""FastAPI entry point for FleetRelay Telegram bot.

Receives Telegram webhook updates and routes them through the classification pipeline.
Also exposes health/stats endpoints for monitoring.
"""

from __future__ import annotations

import asyncio
import hmac
import logging

from fastapi import FastAPI, Request, Response
from telegram import Update

from src.bot import create_bot_application, flush_expired_buffers
from src.config import settings
from src.supabase_storage import storage

logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="FleetRelay Telegram Bot",
    version="0.1.0",
    docs_url="/docs" if settings.environment == "development" else None,
)

_bot_app = create_bot_application()


@app.on_event("startup")
async def startup() -> None:
    await _bot_app.initialize()
    await _bot_app.start()

    if settings.webhook_url:
        webhook_url = f"{settings.webhook_url.rstrip('/')}/webhook"
        await _bot_app.bot.set_webhook(
            url=webhook_url,
            secret_token=settings.webhook_secret or None,
        )
        logger.info("Webhook set: %s", webhook_url)

    asyncio.create_task(flush_expired_buffers())
    logger.info("FleetRelay bot started (env=%s)", settings.environment)


@app.on_event("shutdown")
async def shutdown() -> None:
    await _bot_app.stop()
    await _bot_app.shutdown()
    logger.info("FleetRelay bot stopped")


@app.post("/webhook")
async def webhook(request: Request) -> Response:
    if settings.webhook_secret:
        token = request.headers.get("X-Telegram-Bot-Api-Secret-Token", "")
        if not hmac.compare_digest(token, settings.webhook_secret):
            logger.warning("Webhook request with invalid secret token")
            return Response(status_code=403)

    try:
        body = await request.json()
        update = Update.de_json(body, _bot_app.bot)
        if update:
            await _bot_app.process_update(update)
    except Exception as e:
        logger.error("Webhook processing error: %s", e)

    return Response(status_code=200)


@app.get("/health")
async def health() -> dict:
    stats = await storage.stats()
    return {
        "status": "ok",
        "environment": settings.environment,
        "stats": stats,
    }

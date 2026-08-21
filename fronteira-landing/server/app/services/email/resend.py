from __future__ import annotations

import logging
from typing import Optional

import httpx

logger = logging.getLogger(__name__)

RESEND_ENDPOINT = "https://api.resend.com/emails"


class ResendEmailSender:
    """Implementação default de `EmailSender` via Resend (§B.6, B.9.3)."""

    def __init__(self, api_key: str, email_from: str) -> None:
        self.api_key = api_key
        self.email_from = email_from

    def send(
        self, *, to: str, subject: str, html: str, reply_to: Optional[str] = None
    ) -> None:
        if not self.api_key:
            # Sem chave configurada (dev local sem provedor): no-op silencioso.
            logger.info("RESEND_API_KEY ausente — e-mail para %s não enviado (dev).", to)
            return

        payload: dict[str, object] = {
            "from": self.email_from,
            "to": [to],
            "subject": subject,
            "html": html,
        }
        if reply_to:
            payload["reply_to"] = reply_to

        try:
            response = httpx.post(
                RESEND_ENDPOINT,
                headers={"Authorization": f"Bearer {self.api_key}"},
                json=payload,
                timeout=10,
            )
            response.raise_for_status()
        except httpx.HTTPError:
            # Falha de e-mail não derruba a request — o lead já está no
            # Postgres, fonte da verdade (§B.6). Logar e seguir.
            logger.exception("Falha ao enviar e-mail via Resend (to=%s)", to)

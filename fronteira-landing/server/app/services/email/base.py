from __future__ import annotations

from typing import Optional, Protocol


class EmailSender(Protocol):
    """Interface desacoplada de envio de e-mail (§B.6). Trocar de provedor é
    escrever uma nova implementação deste Protocol — nada mais muda."""

    def send(
        self, *, to: str, subject: str, html: str, reply_to: Optional[str] = None
    ) -> None: ...

from __future__ import annotations

from typing import Optional, Protocol


class EmailSender(Protocol):
    """Interface desacoplada de envio de e-mail (§B.6). Trocar de provedor é
    escrever uma nova implementação deste Protocol — nada mais muda."""

    def send(
        self, *, to: str, subject: str, html: str, reply_to: Optional[str] = None
    ) -> bool:
        """Devolve True se o provedor aceitou o envio, False caso contrário.
        Nunca levanta exceção — chamadores em background (routes/demo.py,
        routes/internal.py) ignoram o retorno de propósito; chamadores
        síncronos e visíveis ao usuário (o reenvio manual do admin) usam o
        retorno pra responder com precisão em vez de sempre dizer "ok"."""
        ...

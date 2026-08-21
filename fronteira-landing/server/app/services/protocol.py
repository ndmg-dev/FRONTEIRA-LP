from __future__ import annotations

import random
from datetime import datetime, timezone

# Crockford Base32, sem I/L/O/U — evita ambiguidade visual no protocolo (§B.4).
ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"


def generate_protocol(year: int | None = None) -> str:
    """Protocolo aleatório `FRT-<ano>-<6 chars>`. Não é sequencial: um contador
    vazaria o volume de leads e permitiria enumeração (§B.4)."""
    year = year or datetime.now(timezone.utc).year
    suffix = "".join(random.choices(ALPHABET, k=6))
    return f"FRT-{year}-{suffix}"

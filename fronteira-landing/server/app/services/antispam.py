from __future__ import annotations

import hashlib
import threading
import time
from collections import defaultdict

MIN_ELAPSED_MS = 2_000
MAX_ELAPSED_MS = 6 * 60 * 60 * 1000


def hash_ip(ip: str, pepper: str) -> str:
    """sha256(ip + pepper) — nunca gravar o IP cru (§B.5, LGPD)."""
    return hashlib.sha256(f"{ip}{pepper}".encode("utf-8")).hexdigest()


def looks_like_spam(hp: str | None, rendered_at_ms: int, now_ms: int) -> bool:
    """Honeypot preenchido OU timing fora da janela [2s, 6h] (§B.3 passos 2-3)."""
    if hp:
        return True
    elapsed = now_ms - rendered_at_ms
    return elapsed < MIN_ELAPSED_MS or elapsed > MAX_ELAPSED_MS


class InMemoryRateLimiter:
    """Janela deslizante de 1h por chave, em memória (default de 1 instância —
    §B.5/B.9.1; trocar por Redis para múltiplas instâncias)."""

    def __init__(self) -> None:
        self._hits: dict[str, list[float]] = defaultdict(list)
        self._lock = threading.Lock()

    def hit(self, key: str, limit_per_hour: int) -> bool:
        """Registra uma tentativa; devolve True se o limite já estava estourado
        (a tentativa atual não conta para a janela nesse caso)."""
        now = time.time()
        window_start = now - 3600
        with self._lock:
            hits = [t for t in self._hits[key] if t > window_start]
            over_limit = len(hits) >= limit_per_hour
            if not over_limit:
                hits.append(now)
            self._hits[key] = hits
            return over_limit

    def reset(self) -> None:
        with self._lock:
            self._hits.clear()


_rate_limiter = InMemoryRateLimiter()


def is_rate_limited(ip_hash: str, limit_per_hour: int) -> bool:
    return _rate_limiter.hit(ip_hash, limit_per_hour)


def reset_rate_limiter() -> None:
    """Só para testes — limpa o estado do limitador in-memory entre casos."""
    _rate_limiter.reset()

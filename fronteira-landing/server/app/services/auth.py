from __future__ import annotations

from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

JWT_ALGORITHM = "HS256"
TOKEN_TTL = timedelta(hours=12)


def verify_password(password: str, password_hash: str) -> bool:
    """`password_hash` vem de `ADMIN_PASSWORD_HASH` (bcrypt, gerado offline —
    ver `server/README.md`). Uma hash vazia nunca confere, mesmo com senha
    vazia."""
    if not password_hash:
        return False
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except ValueError:
        # Hash malformada na env var — trata como "nunca autentica".
        return False


def create_admin_token(username: str, secret: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {"sub": username, "iat": now, "exp": now + TOKEN_TTL}
    return jwt.encode(payload, secret, algorithm=JWT_ALGORITHM)


def decode_admin_token(token: str, secret: str) -> str | None:
    """Devolve o `sub` (username) se o token for válido, senão `None`."""
    try:
        payload = jwt.decode(token, secret, algorithms=[JWT_ALGORITHM])
    except jwt.InvalidTokenError:
        return None
    return payload.get("sub")

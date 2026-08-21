from __future__ import annotations

import os

import psycopg
import pytest
from sqlalchemy import text

TEST_DB_NAME = "fronteira_test"
MAINTENANCE_DATABASE_URL = os.environ.get(
    "TEST_MAINTENANCE_DATABASE_URL",
    "postgresql://fronteira:fronteira@localhost:5432/postgres",
)
TEST_DATABASE_URL = os.environ.get(
    "TEST_DATABASE_URL",
    f"postgresql+psycopg://fronteira:fronteira@localhost:5432/{TEST_DB_NAME}",
)


def _ensure_test_database() -> None:
    """Cria o banco de teste isolado (§B.8) se ainda não existir, conectando
    à base de manutenção `postgres` da mesma instância."""
    conn = psycopg.connect(MAINTENANCE_DATABASE_URL, autocommit=True)
    try:
        exists = conn.execute(
            "SELECT 1 FROM pg_database WHERE datname = %s", (TEST_DB_NAME,)
        ).fetchone()
        if not exists:
            conn.execute(f'CREATE DATABASE "{TEST_DB_NAME}"')
    finally:
        conn.close()


_ensure_test_database()

# As envs precisam existir ANTES de `app.db`/`app.main` serem importados —
# Settings() e o engine leem o ambiente no import do módulo.
os.environ["DATABASE_URL"] = TEST_DATABASE_URL
os.environ.setdefault("IP_HASH_PEPPER", "test-pepper")
os.environ.setdefault("ALLOWED_ORIGINS", "http://localhost:5173")
os.environ.setdefault("RATE_LIMIT_PER_HOUR", "1000")
os.environ.setdefault("RESEND_API_KEY", "")
os.environ.setdefault("EMAIL_FROM", "Fronteira <contato@fronteira.test>")
os.environ.setdefault("TEAM_INBOX", "time@fronteira.test")
os.environ.setdefault("INTERNAL_API_TOKEN", "test-internal-token")

from app.db import Base, SessionLocal, engine  # noqa: E402
from app.deps import get_email_sender  # noqa: E402
from app.main import app  # noqa: E402
from app.services import antispam  # noqa: E402
from app.services.email.base import EmailSender  # noqa: E402


class FakeEmailSender(EmailSender):
    """Sender fake para os testes (§B.8) — nunca toca a rede, só registra."""

    def __init__(self) -> None:
        self.sent: list[dict[str, object]] = []

    def send(self, *, to, subject, html, reply_to=None) -> None:  # type: ignore[override]
        self.sent.append({"to": to, "subject": subject, "html": html, "reply_to": reply_to})


@pytest.fixture(scope="session", autouse=True)
def _schema():
    with engine.begin() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS pgcrypto"))
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS citext"))
    Base.metadata.create_all(engine)
    yield
    Base.metadata.drop_all(engine)


@pytest.fixture(autouse=True)
def _clean_state():
    with engine.begin() as conn:
        conn.execute(text("TRUNCATE TABLE demo_requests RESTART IDENTITY CASCADE"))
    antispam.reset_rate_limiter()
    yield


@pytest.fixture
def db_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def fake_email_sender():
    sender = FakeEmailSender()
    app.dependency_overrides[get_email_sender] = lambda: sender
    yield sender
    app.dependency_overrides.pop(get_email_sender, None)


@pytest.fixture
def client():
    from fastapi.testclient import TestClient

    return TestClient(app)

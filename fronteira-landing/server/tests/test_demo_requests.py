from __future__ import annotations

import time

import pytest

from app.config import Settings
from app.deps import get_settings
from app.main import app
from app.models import DemoRequest

VALID_PAYLOAD = {
    "name": "Arthur Monteiro",
    "office": "Mendonça Galvão Contabilidade",
    "email": "arthur@escritorio.com.br",
    "volume": "51-200",
    "consent": True,
    "hp": "",
    "utm": {"source": "google", "medium": "cpc"},
    "referrer": "https://google.com",
    "landingPath": "/",
}


def _payload(**overrides):
    data = dict(VALID_PAYLOAD)
    data["renderedAt"] = int(time.time() * 1000) - 5_000
    data.update(overrides)
    return data


def _count(db_session) -> int:
    return db_session.query(DemoRequest).count()


def test_health(client):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}


def test_create_demo_request_success(client, fake_email_sender, db_session):
    res = client.post("/demo-requests", json=_payload())
    assert res.status_code == 201

    body = res.json()
    protocol = body["protocol"]
    assert protocol.startswith("FRT-")
    parts = protocol.split("-")
    assert len(parts) == 3
    assert len(parts[2]) == 6

    assert _count(db_session) == 1

    # BackgroundTasks roda de forma síncrona dentro do ciclo do TestClient.
    assert len(fake_email_sender.sent) == 2
    subjects = {m["subject"] for m in fake_email_sender.sent}
    assert any("Nova demo" in s for s in subjects)
    assert any(protocol in s for s in subjects)
    team_mail = next(m for m in fake_email_sender.sent if "Nova demo" in m["subject"])
    assert team_mail["reply_to"] == "arthur@escritorio.com.br"


@pytest.mark.parametrize(
    "field,value,expected_fragment",
    [
        ("name", "   ", "nome"),
        ("office", "", "escritório"),
        ("email", "nao-e-email", "e-mail"),
        ("volume", "50-99", "faixa"),
        ("consent", False, "aceitar"),
    ],
)
def test_validation_per_field_returns_422(client, field, value, expected_fragment):
    payload = _payload(**{field: value})
    res = client.post("/demo-requests", json=payload)
    assert res.status_code == 422
    body = res.json()
    assert field in body
    assert expected_fragment.lower() in body[field].lower()


def test_honeypot_filled_is_not_persisted(client, fake_email_sender, db_session):
    res = client.post("/demo-requests", json=_payload(hp="eu-sou-um-robo"))
    assert res.status_code == 200
    assert res.json()["protocol"].startswith("FRT-")
    assert _count(db_session) == 0
    assert fake_email_sender.sent == []


def test_timing_too_fast_is_treated_as_spam(client, fake_email_sender, db_session):
    payload = _payload()
    payload["renderedAt"] = int(time.time() * 1000)  # ~0ms decorrido
    res = client.post("/demo-requests", json=payload)
    assert res.status_code == 200
    assert _count(db_session) == 0
    assert fake_email_sender.sent == []


def test_timing_too_slow_is_treated_as_spam(client, fake_email_sender, db_session):
    payload = _payload()
    payload["renderedAt"] = int(time.time() * 1000) - 7 * 60 * 60 * 1000  # 7h atrás
    res = client.post("/demo-requests", json=payload)
    assert res.status_code == 200
    assert _count(db_session) == 0
    assert fake_email_sender.sent == []


def test_dedupe_by_email_within_window(client, fake_email_sender, db_session):
    first = client.post("/demo-requests", json=_payload())
    assert first.status_code == 201
    protocol_1 = first.json()["protocol"]

    second = client.post("/demo-requests", json=_payload(name="Outra Pessoa"))
    assert second.status_code == 200
    assert second.json()["protocol"] == protocol_1

    assert _count(db_session) == 1
    assert len(fake_email_sender.sent) == 2  # só a primeira solicitação notifica


def test_rate_limit_returns_429(client, fake_email_sender):
    app.dependency_overrides[get_settings] = lambda: Settings(rate_limit_per_hour=1)
    try:
        first = client.post("/demo-requests", json=_payload(email="um@escritorio.com.br"))
        assert first.status_code == 201

        second = client.post("/demo-requests", json=_payload(email="dois@escritorio.com.br"))
        assert second.status_code == 429
    finally:
        app.dependency_overrides.pop(get_settings, None)


def test_protocol_is_unique_and_retries_on_collision(client, fake_email_sender, monkeypatch):
    calls = iter(["FRT-2026-FIXED1", "FRT-2026-FIXED1", "FRT-2026-FIXED2"])
    monkeypatch.setattr("app.routes.demo.generate_protocol", lambda: next(calls))

    first = client.post("/demo-requests", json=_payload(email="colisao1@escritorio.com.br"))
    assert first.status_code == 201
    assert first.json()["protocol"] == "FRT-2026-FIXED1"

    second = client.post("/demo-requests", json=_payload(email="colisao2@escritorio.com.br"))
    assert second.status_code == 201
    assert second.json()["protocol"] == "FRT-2026-FIXED2"

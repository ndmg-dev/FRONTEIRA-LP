from __future__ import annotations

from datetime import datetime, timezone

from app.models import DemoRequest
from app.services.protocol import generate_protocol

from .conftest import ADMIN_TEST_PASSWORD


def _create_row(db_session, *, status: str = "novo", email: str | None = None):
    row = DemoRequest(
        protocol=generate_protocol(),
        name="Arthur Monteiro",
        office="Mendonça Galvão Contabilidade",
        email=email or f"lead-{generate_protocol()}@escritorio.com.br",
        volume="51-200",
        consent=True,
        consent_at=datetime.now(timezone.utc),
        status=status,
    )
    db_session.add(row)
    db_session.commit()
    db_session.refresh(row)
    return row


def _login(client, password: str = ADMIN_TEST_PASSWORD) -> str:
    res = client.post("/admin/login", json={"username": "admin", "password": password})
    assert res.status_code == 200
    return res.json()["token"]


def test_login_success(client):
    token = _login(client)
    assert token


def test_login_wrong_password(client):
    res = client.post("/admin/login", json={"username": "admin", "password": "errada"})
    assert res.status_code == 401


def test_login_wrong_username(client):
    res = client.post(
        "/admin/login", json={"username": "outro", "password": ADMIN_TEST_PASSWORD}
    )
    assert res.status_code == 401


def test_leads_requires_auth(client):
    res = client.get("/admin/leads")
    assert res.status_code == 401


def test_leads_rejects_invalid_token(client):
    res = client.get("/admin/leads", headers={"Authorization": "Bearer lixo"})
    assert res.status_code == 401


def test_leads_list_and_filter(client, db_session):
    _create_row(db_session, status="novo")
    _create_row(db_session, status="contatado")
    token = _login(client)
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/admin/leads", headers=headers)
    assert res.status_code == 200
    body = res.json()
    assert body["total"] == 2
    assert len(body["items"]) == 2

    res = client.get("/admin/leads?status_filter=contatado", headers=headers)
    assert res.status_code == 200
    body = res.json()
    assert body["total"] == 1
    assert body["items"][0]["status"] == "contatado"


def test_update_lead_status(client, db_session):
    row = _create_row(db_session, status="novo")
    token = _login(client)
    headers = {"Authorization": f"Bearer {token}"}

    res = client.patch(
        f"/admin/leads/{row.id}/status", json={"status": "fechado"}, headers=headers
    )
    assert res.status_code == 200
    assert res.json()["status"] == "fechado"

    db_session.refresh(row)
    assert row.status == "fechado"


def test_update_lead_status_requires_auth(client, db_session):
    row = _create_row(db_session, status="novo")
    res = client.patch(f"/admin/leads/{row.id}/status", json={"status": "fechado"})
    assert res.status_code == 401


def test_update_lead_status_rejects_unknown_value(client, db_session):
    row = _create_row(db_session, status="novo")
    token = _login(client)
    res = client.patch(
        f"/admin/leads/{row.id}/status",
        json={"status": "nao-existe"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 422


def test_update_lead_status_404_for_unknown_id(client):
    token = _login(client)
    res = client.patch(
        "/admin/leads/00000000-0000-0000-0000-000000000000/status",
        json={"status": "fechado"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 404

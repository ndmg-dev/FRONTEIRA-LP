from __future__ import annotations

from datetime import datetime, timezone

from app.models import DemoRequest
from app.services.protocol import generate_protocol

from .conftest import ADMIN_TEST_PASSWORD


def _create_row(
    db_session,
    *,
    status: str = "novo",
    email: str | None = None,
    name: str = "Arthur Monteiro",
    office: str = "Mendonça Galvão Contabilidade",
):
    row = DemoRequest(
        protocol=generate_protocol(),
        name=name,
        office=office,
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


def test_resend_followup_sends_email_and_marks_sent(client, fake_email_sender, db_session):
    row = _create_row(db_session, status="novo")
    token = _login(client)
    headers = {"Authorization": f"Bearer {token}"}

    res = client.post(f"/admin/leads/{row.id}/resend-followup", headers=headers)
    assert res.status_code == 200
    assert res.json()["followup_sent_at"] is not None

    assert len(fake_email_sender.sent) == 1
    assert fake_email_sender.sent[0]["to"] == row.email

    db_session.refresh(row)
    assert row.followup_sent_at is not None


def test_resend_followup_ignores_status_and_timing(client, fake_email_sender, db_session):
    # status "fechado" e lead recém-criado — o cron automático nunca pegaria
    # esse lead, mas o disparo manual deve funcionar de qualquer forma.
    row = _create_row(db_session, status="fechado")
    token = _login(client)
    headers = {"Authorization": f"Bearer {token}"}

    res = client.post(f"/admin/leads/{row.id}/resend-followup", headers=headers)
    assert res.status_code == 200
    assert len(fake_email_sender.sent) == 1


def test_resend_followup_requires_auth(client, db_session):
    row = _create_row(db_session, status="novo")
    res = client.post(f"/admin/leads/{row.id}/resend-followup")
    assert res.status_code == 401


def test_resend_followup_404_for_unknown_id(client):
    token = _login(client)
    res = client.post(
        "/admin/leads/00000000-0000-0000-0000-000000000000/resend-followup",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 404


def test_resend_followup_reports_provider_failure(client, fake_email_sender, db_session):
    row = _create_row(db_session, status="novo")
    fake_email_sender.fail = True
    token = _login(client)

    res = client.post(
        f"/admin/leads/{row.id}/resend-followup",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 502

    db_session.refresh(row)
    assert row.followup_sent_at is None


def test_leads_search_matches_name_office_or_email(client, db_session):
    _create_row(db_session, name="Arthur Monteiro", office="Mendonça Galvão", email="a@x.com.br")
    _create_row(db_session, name="Beatriz Souza", office="Contábil Souza", email="b@y.com.br")
    token = _login(client)
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/admin/leads?search=arthur", headers=headers)
    assert res.json()["total"] == 1
    assert res.json()["items"][0]["name"] == "Arthur Monteiro"

    res = client.get("/admin/leads?search=souza", headers=headers)
    assert res.json()["total"] == 1
    assert res.json()["items"][0]["name"] == "Beatriz Souza"

    res = client.get("/admin/leads?search=b@y.com.br", headers=headers)
    assert res.json()["total"] == 1

    res = client.get("/admin/leads?search=inexistente", headers=headers)
    assert res.json()["total"] == 0


def test_leads_search_is_case_insensitive(client, db_session):
    _create_row(db_session, name="Arthur Monteiro")
    token = _login(client)
    res = client.get(
        "/admin/leads?search=ARTHUR", headers={"Authorization": f"Bearer {token}"}
    )
    assert res.json()["total"] == 1


def test_export_leads_requires_auth(client, db_session):
    _create_row(db_session)
    res = client.get("/admin/leads/export")
    assert res.status_code == 401


def test_export_leads_returns_csv_with_all_matches(client, db_session):
    for i in range(3):
        _create_row(db_session, name=f"Lead {i}", email=f"lead{i}@escritorio.com.br")
    token = _login(client)

    res = client.get(
        "/admin/leads/export", headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    assert res.headers["content-type"].startswith("text/csv")
    assert "attachment" in res.headers["content-disposition"]

    body = res.text.lstrip("﻿")
    lines = body.strip().splitlines()
    assert lines[0].startswith("protocolo,")
    assert len(lines) == 4  # header + 3 leads


def test_export_leads_respects_filters(client, db_session):
    _create_row(db_session, name="Arthur Monteiro", status="novo")
    _create_row(db_session, name="Beatriz Souza", status="fechado")
    token = _login(client)
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/admin/leads/export?status_filter=fechado", headers=headers)
    lines = res.text.lstrip("﻿").strip().splitlines()
    assert len(lines) == 2
    assert "Beatriz Souza" in lines[1]


def test_update_lead_notes(client, db_session):
    row = _create_row(db_session)
    token = _login(client)
    headers = {"Authorization": f"Bearer {token}"}

    res = client.patch(
        f"/admin/leads/{row.id}/notes",
        json={"notes": "Liguei às 14h, sem resposta."},
        headers=headers,
    )
    assert res.status_code == 200
    assert res.json()["notes"] == "Liguei às 14h, sem resposta."

    db_session.refresh(row)
    assert row.notes == "Liguei às 14h, sem resposta."


def test_update_lead_notes_requires_auth(client, db_session):
    row = _create_row(db_session)
    res = client.patch(f"/admin/leads/{row.id}/notes", json={"notes": "x"})
    assert res.status_code == 401


def test_update_lead_notes_404_for_unknown_id(client):
    token = _login(client)
    res = client.patch(
        "/admin/leads/00000000-0000-0000-0000-000000000000/notes",
        json={"notes": "x"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 404

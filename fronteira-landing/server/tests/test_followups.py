from __future__ import annotations

import time
from datetime import datetime, timedelta, timezone

from app.models import DemoRequest
from app.services.protocol import generate_protocol

INTERNAL_HEADERS = {"X-Internal-Token": "test-internal-token"}


def _create_row(db_session, *, created_days_ago: int, status: str = "novo", followup_sent_at=None):
    row = DemoRequest(
        protocol=generate_protocol(),
        name="Arthur Monteiro",
        office="Mendonça Galvão Contabilidade",
        email=f"lead-{int(time.time() * 1000)}@escritorio.com.br",
        volume="51-200",
        consent=True,
        consent_at=datetime.now(timezone.utc),
        status=status,
        created_at=datetime.now(timezone.utc) - timedelta(days=created_days_ago),
        followup_sent_at=followup_sent_at,
    )
    db_session.add(row)
    db_session.commit()
    db_session.refresh(row)
    return row


def test_send_followups_requires_token(client):
    res = client.post("/internal/send-followups")
    assert res.status_code == 401


def test_send_followups_rejects_wrong_token(client):
    res = client.post("/internal/send-followups", headers={"X-Internal-Token": "errado"})
    assert res.status_code == 401


def test_send_followups_sends_for_overdue_untouched_lead(client, fake_email_sender, db_session):
    row = _create_row(db_session, created_days_ago=5)

    res = client.post("/internal/send-followups", headers=INTERNAL_HEADERS)
    assert res.status_code == 200
    assert res.json() == {"sent": 1}

    assert len(fake_email_sender.sent) == 1
    assert fake_email_sender.sent[0]["to"] == row.email
    assert row.protocol in fake_email_sender.sent[0]["subject"]

    db_session.refresh(row)
    assert row.followup_sent_at is not None


def test_send_followups_skips_recent_lead(client, fake_email_sender, db_session):
    _create_row(db_session, created_days_ago=0)

    res = client.post("/internal/send-followups", headers=INTERNAL_HEADERS)
    assert res.status_code == 200
    assert res.json() == {"sent": 0}
    assert fake_email_sender.sent == []


def test_send_followups_skips_lead_already_handled(client, fake_email_sender, db_session):
    _create_row(db_session, created_days_ago=5, status="contatado")

    res = client.post("/internal/send-followups", headers=INTERNAL_HEADERS)
    assert res.status_code == 200
    assert res.json() == {"sent": 0}
    assert fake_email_sender.sent == []


def test_send_followups_skips_lead_already_sent(client, fake_email_sender, db_session):
    _create_row(
        db_session,
        created_days_ago=5,
        followup_sent_at=datetime.now(timezone.utc) - timedelta(days=1),
    )

    res = client.post("/internal/send-followups", headers=INTERNAL_HEADERS)
    assert res.status_code == 200
    assert res.json() == {"sent": 0}
    assert fake_email_sender.sent == []


def test_send_followups_is_idempotent_across_calls(client, fake_email_sender, db_session):
    _create_row(db_session, created_days_ago=5)

    first = client.post("/internal/send-followups", headers=INTERNAL_HEADERS)
    assert first.json() == {"sent": 1}

    second = client.post("/internal/send-followups", headers=INTERNAL_HEADERS)
    assert second.json() == {"sent": 0}
    assert len(fake_email_sender.sent) == 1

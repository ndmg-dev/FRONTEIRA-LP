from __future__ import annotations

import time
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, Response, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..config import Settings
from ..deps import get_db, get_email_sender, get_settings
from ..models import DemoRequest
from ..schemas import DemoRequestIn, DemoRequestOut
from ..services import antispam
from ..services.email.base import EmailSender
from ..services.email.templates import lead_autoresponse, team_notification
from ..services.protocol import generate_protocol

router = APIRouter()

DEDUPE_WINDOW_MINUTES = 10


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


def _client_ip(request: Request) -> str:
    return request.client.host if request.client else "unknown"


def _send_demo_emails(row_data: dict, sender: EmailSender, settings: Settings) -> None:
    """Roda em BackgroundTasks, após o commit (§B.3 passo 7). Falha de e-mail
    não deve propagar — cada implementação de EmailSender.send já absorve e
    loga seus próprios erros (ver ResendEmailSender)."""
    team_subject, team_html = team_notification(row_data)
    sender.send(
        to=settings.team_inbox,
        subject=team_subject,
        html=team_html,
        reply_to=row_data["email"],
    )
    lead_subject, lead_html = lead_autoresponse(row_data)
    sender.send(to=row_data["email"], subject=lead_subject, html=lead_html)


@router.post(
    "/demo-requests",
    response_model=DemoRequestOut,
    status_code=status.HTTP_201_CREATED,
)
def create_demo_request(
    payload: DemoRequestIn,
    response: Response,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
    email_sender: EmailSender = Depends(get_email_sender),
) -> DemoRequestOut:
    # 1. Validação já rodou via DemoRequestIn (pydantic) antes de chegarmos aqui.

    # 2-3. Honeypot + timing — bot não distingue de um envio de verdade: 200
    # com protocolo descartável, sem persistir nem notificar (§B.3).
    now_ms = int(time.time() * 1000)
    if antispam.looks_like_spam(payload.hp, payload.rendered_at, now_ms):
        response.status_code = status.HTTP_200_OK
        return DemoRequestOut(protocol=generate_protocol())

    # 4. Rate-limit por ip_hash.
    ip_hash = antispam.hash_ip(_client_ip(request), settings.ip_hash_pepper)
    if antispam.is_rate_limited(ip_hash, settings.rate_limit_per_hour):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Muitas solicitações. Tente novamente em instantes.",
        )

    # 5. Dedupe por e-mail na janela — protege contra duplo-clique/reenvio.
    dedupe_since = datetime.now(timezone.utc) - timedelta(minutes=DEDUPE_WINDOW_MINUTES)
    existing = (
        db.query(DemoRequest)
        .filter(DemoRequest.email == payload.email)
        .filter(DemoRequest.created_at >= dedupe_since)
        .order_by(DemoRequest.created_at.desc())
        .first()
    )
    if existing is not None:
        response.status_code = status.HTTP_200_OK
        return DemoRequestOut(protocol=existing.protocol)

    # 6. Persistir.
    row = DemoRequest(
        protocol=generate_protocol(),
        name=payload.name,
        office=payload.office,
        email=payload.email,
        volume=payload.volume,
        utm=payload.utm,
        referrer=payload.referrer,
        landing_path=payload.landing_path,
        user_agent=request.headers.get("user-agent"),
        ip_hash=ip_hash,
        consent=payload.consent,
        consent_at=datetime.now(timezone.utc),
    )
    db.add(row)
    try:
        db.commit()
    except IntegrityError:
        # Colisão de protocolo (astronomicamente improvável) — regerar uma vez.
        db.rollback()
        row.protocol = generate_protocol()
        db.add(row)
        db.commit()
    db.refresh(row)

    # 7. E-mail assíncrono, agendado só depois do commit acima.
    row_data = {
        "protocol": row.protocol,
        "name": row.name,
        "office": row.office,
        "email": row.email,
        "volume": row.volume,
        "utm": row.utm,
        "referrer": row.referrer,
        "landing_path": row.landing_path,
    }
    background_tasks.add_task(_send_demo_emails, row_data, email_sender, settings)

    # 8. 201 { protocol }.
    return DemoRequestOut(protocol=row.protocol)

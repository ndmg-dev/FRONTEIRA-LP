from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from ..config import Settings
from ..deps import get_db, get_email_sender, get_settings
from ..models import DemoRequest
from ..services.business_days import subtract_business_days
from ..services.email.base import EmailSender
from ..services.email.templates import lead_followup

router = APIRouter(prefix="/internal")


def _check_internal_token(x_internal_token: str = Header(default="")) -> None:
    settings = get_settings()
    if not settings.internal_api_token or x_internal_token != settings.internal_api_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Não autorizado.")


@router.post("/send-followups", dependencies=[Depends(_check_internal_token)])
def send_followups(
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
    email_sender: EmailSender = Depends(get_email_sender),
) -> dict[str, int]:
    """Chamado por um cron externo (Coolify). Envia o follow-up para todo lead
    com status "novo" (ninguém do time mexeu ainda), criado há pelo menos
    `followup_business_days` dias úteis, que ainda não recebeu follow-up."""
    cutoff = subtract_business_days(datetime.now(timezone.utc), settings.followup_business_days)
    due = (
        db.query(DemoRequest)
        .filter(DemoRequest.status == "novo")
        .filter(DemoRequest.followup_sent_at.is_(None))
        .filter(DemoRequest.created_at <= cutoff)
        .all()
    )

    sent = 0
    for row in due:
        subject, html = lead_followup(
            {"protocol": row.protocol, "name": row.name, "office": row.office}
        )
        email_sender.send(to=row.email, subject=subject, html=html)
        row.followup_sent_at = datetime.now(timezone.utc)
        sent += 1

    db.commit()
    return {"sent": sent}

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlalchemy.orm import Session

from ..config import Settings
from ..deps import get_db, get_settings
from ..models import DemoRequest
from ..schemas import AdminLoginIn, AdminLoginOut, LeadListOut, LeadOut, LeadStatusIn
from ..services import antispam
from ..services.auth import create_admin_token, decode_admin_token, verify_password

router = APIRouter(prefix="/admin")

LOGIN_RATE_LIMIT_PER_HOUR = 10
PAGE_SIZE = 50


def _client_ip(request: Request) -> str:
    return request.client.host if request.client else "unknown"


def require_admin(
    authorization: str = Header(default=""),
    settings: Settings = Depends(get_settings),
) -> str:
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Não autenticado.")

    username = decode_admin_token(token, settings.admin_jwt_secret)
    if username is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sessão inválida ou expirada.")
    return username


@router.post("/login", response_model=AdminLoginOut)
def login(
    payload: AdminLoginIn,
    request: Request,
    settings: Settings = Depends(get_settings),
) -> AdminLoginOut:
    ip_hash = antispam.hash_ip(_client_ip(request), settings.ip_hash_pepper)
    if antispam.is_rate_limited(f"admin-login:{ip_hash}", LOGIN_RATE_LIMIT_PER_HOUR):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Muitas tentativas. Tente novamente em instantes.",
        )

    valid_user = bool(settings.admin_username) and payload.username == settings.admin_username
    valid_password = verify_password(payload.password, settings.admin_password_hash)
    if not (valid_user and valid_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuário ou senha inválidos.")

    token = create_admin_token(payload.username, settings.admin_jwt_secret)
    return AdminLoginOut(token=token)


@router.get("/leads", response_model=LeadListOut, dependencies=[Depends(require_admin)])
def list_leads(
    page: int = 1,
    status_filter: str | None = None,
    db: Session = Depends(get_db),
) -> LeadListOut:
    query = db.query(DemoRequest)
    if status_filter:
        query = query.filter(DemoRequest.status == status_filter)

    total = query.count()
    page = max(page, 1)
    rows = (
        query.order_by(DemoRequest.created_at.desc())
        .offset((page - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .all()
    )
    return LeadListOut(items=rows, total=total, page=page, page_size=PAGE_SIZE)


@router.patch("/leads/{lead_id}/status", response_model=LeadOut, dependencies=[Depends(require_admin)])
def update_lead_status(
    lead_id: str,
    payload: LeadStatusIn,
    db: Session = Depends(get_db),
) -> DemoRequest:
    try:
        parsed_id = uuid.UUID(lead_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead não encontrado.")

    row = db.query(DemoRequest).filter(DemoRequest.id == parsed_id).first()
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead não encontrado.")

    row.status = payload.status
    db.commit()
    db.refresh(row)
    return row

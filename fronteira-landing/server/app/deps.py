from __future__ import annotations

from functools import lru_cache
from typing import Iterator

from sqlalchemy.orm import Session

from .config import Settings
from .db import SessionLocal
from .services.email.base import EmailSender
from .services.email.resend import ResendEmailSender


@lru_cache
def get_settings() -> Settings:
    return Settings()


def get_db() -> Iterator[Session]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_email_sender() -> EmailSender:
    settings = get_settings()
    return ResendEmailSender(api_key=settings.resend_api_key, email_from=settings.email_from)

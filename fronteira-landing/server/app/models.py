from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Text, func
from sqlalchemy.dialects.postgresql import CITEXT, JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from .db import Base


class DemoRequest(Base):
    """Uma solicitação de demonstração (§B.2)."""

    __tablename__ = "demo_requests"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid()
    )
    protocol: Mapped[str] = mapped_column(Text, unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    office: Mapped[str] = mapped_column(Text, nullable=False)
    email: Mapped[str] = mapped_column(CITEXT, nullable=False, index=True)
    volume: Mapped[str] = mapped_column(Text, nullable=False)
    utm: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    referrer: Mapped[str | None] = mapped_column(Text, nullable=True)
    landing_path: Mapped[str | None] = mapped_column(Text, nullable=True)
    user_agent: Mapped[str | None] = mapped_column(Text, nullable=True)
    ip_hash: Mapped[str | None] = mapped_column(Text, nullable=True)
    consent: Mapped[bool] = mapped_column(Boolean, nullable=False)
    consent_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[str] = mapped_column(Text, nullable=False, server_default="novo")
    followup_sent_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )

"""add followup_sent_at to demo_requests

Revision ID: 0002_add_followup_sent_at
Revises: 0001_create_demo_requests
Create Date: 2026-08-21

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0002_add_followup_sent_at"
down_revision: Union[str, None] = "0001_create_demo_requests"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "demo_requests",
        sa.Column("followup_sent_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("demo_requests", "followup_sent_at")

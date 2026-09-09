"""add notes to demo_requests

Revision ID: 0003_add_lead_notes
Revises: 0002_add_followup_sent_at
Create Date: 2026-09-09

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0003_add_lead_notes"
down_revision: Union[str, None] = "0002_add_followup_sent_at"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("demo_requests", sa.Column("notes", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("demo_requests", "notes")

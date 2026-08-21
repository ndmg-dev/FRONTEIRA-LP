"""create demo_requests

Revision ID: 0001_create_demo_requests
Revises:
Create Date: 2026-08-21

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "0001_create_demo_requests"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto")
    op.execute("CREATE EXTENSION IF NOT EXISTS citext")

    op.create_table(
        "demo_requests",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("protocol", sa.Text(), nullable=False),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("office", sa.Text(), nullable=False),
        sa.Column("email", postgresql.CITEXT(), nullable=False),
        sa.Column("volume", sa.Text(), nullable=False),
        sa.Column("utm", postgresql.JSONB(), nullable=True),
        sa.Column("referrer", sa.Text(), nullable=True),
        sa.Column("landing_path", sa.Text(), nullable=True),
        sa.Column("user_agent", sa.Text(), nullable=True),
        sa.Column("ip_hash", sa.Text(), nullable=True),
        sa.Column("consent", sa.Boolean(), nullable=False),
        sa.Column("consent_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("status", sa.Text(), nullable=False, server_default="novo"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )
    op.create_unique_constraint("uq_demo_requests_protocol", "demo_requests", ["protocol"])
    op.create_index("ix_demo_requests_email", "demo_requests", ["email"])
    op.create_index("ix_demo_requests_created_at", "demo_requests", ["created_at"])


def downgrade() -> None:
    op.drop_index("ix_demo_requests_created_at", table_name="demo_requests")
    op.drop_index("ix_demo_requests_email", table_name="demo_requests")
    op.drop_constraint("uq_demo_requests_protocol", "demo_requests", type_="unique")
    op.drop_table("demo_requests")

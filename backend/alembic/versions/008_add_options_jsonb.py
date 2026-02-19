"""add options JSONB for tool-specific params

Revision ID: 008
Revises: 007
Create Date: 2026-02-19

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

revision: str = "008"
down_revision: Union[str, None] = "007"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("jobs", sa.Column("options", JSONB, nullable=True))


def downgrade() -> None:
    op.drop_column("jobs", "options")

"""add started_at and finished_at to jobs

Revision ID: 003
Revises: 002
Create Date: 2025-02-14 18:30:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("jobs", sa.Column("started_at", sa.DateTime(), nullable=True))
    op.add_column("jobs", sa.Column("finished_at", sa.DateTime(), nullable=True))


def downgrade() -> None:
    op.drop_column("jobs", "finished_at")
    op.drop_column("jobs", "started_at")

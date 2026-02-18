"""add target_format and quality for convert jobs

Revision ID: 007
Revises: 006
Create Date: 2026-02-15

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "007"
down_revision: Union[str, None] = "006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("jobs", sa.Column("target_format", sa.String(16), nullable=True))
    op.add_column("jobs", sa.Column("quality", sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column("jobs", "quality")
    op.drop_column("jobs", "target_format")

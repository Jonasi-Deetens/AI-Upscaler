"""add denoise_first and face_enhance to jobs

Revision ID: 004
Revises: 003
Create Date: 2026-02-15

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "004"
down_revision: Union[str, None] = "003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("jobs", sa.Column("denoise_first", sa.Boolean(), nullable=False, server_default="false"))
    op.add_column("jobs", sa.Column("face_enhance", sa.Boolean(), nullable=False, server_default="false"))


def downgrade() -> None:
    op.drop_column("jobs", "face_enhance")
    op.drop_column("jobs", "denoise_first")

import uuid
from datetime import datetime
from sqlalchemy import String, Integer, DateTime, Text, Column
from sqlalchemy.dialects.postgresql import UUID

# Minimal model matching backend jobs table for worker updates
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


class Job(Base):
    __tablename__ = "jobs"

    id = Column(UUID(as_uuid=True), primary_key=True)
    status = Column(String(32), nullable=False)
    original_filename = Column(String(512), nullable=False)
    original_key = Column(String(512), nullable=False)
    result_key = Column(String(512), nullable=True)
    scale = Column(Integer, nullable=False)
    method = Column(String(32), nullable=False)
    created_at = Column(DateTime, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    started_at = Column(DateTime, nullable=True)
    finished_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
    status_detail = Column(String(256), nullable=True)

import uuid
from datetime import datetime, timezone
from sqlalchemy import Boolean, String, Integer, DateTime, Text, Index, Column
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


def _utcnow_naive() -> datetime:
    """Current UTC as naive datetime for DB (columns are naive)."""
    return datetime.now(timezone.utc).replace(tzinfo=None)

JOB_STATUS_QUEUED = "queued"
JOB_STATUS_PROCESSING = "processing"
JOB_STATUS_COMPLETED = "completed"
JOB_STATUS_FAILED = "failed"

JOB_METHOD_REAL_ESRGAN = "real_esrgan"
JOB_METHOD_SWINIR = "swinir"
JOB_METHOD_ESRGAN = "esrgan"
JOB_METHOD_REAL_ESRGAN_ANIME = "real_esrgan_anime"
JOB_METHOD_BACKGROUND_REMOVE = "background_remove"
JOB_METHOD_CONVERT = "convert"


class Job(Base):
    __tablename__ = "jobs"
    __table_args__ = (
        Index("ix_jobs_status", "status"),
        Index("ix_jobs_expires_at", "expires_at"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    status = Column(String(32), nullable=False, default=JOB_STATUS_QUEUED)
    original_filename = Column(String(512), nullable=False)
    original_key = Column(String(512), nullable=False)
    result_key = Column(String(512), nullable=True)
    scale = Column(Integer, nullable=False)
    method = Column(String(32), nullable=False)
    denoise_first = Column(Boolean, nullable=False, default=False)
    face_enhance = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, nullable=False, default=_utcnow_naive)
    expires_at = Column(DateTime, nullable=False)
    started_at = Column(DateTime, nullable=True)
    finished_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
    status_detail = Column(String(256), nullable=True)
    celery_task_id = Column(String(255), nullable=True)
    progress = Column(Integer, nullable=True)  # 0-100 when processing
    target_format = Column(String(16), nullable=True)  # for convert: webp, png, jpeg
    quality = Column(Integer, nullable=True)  # for convert: 1-100

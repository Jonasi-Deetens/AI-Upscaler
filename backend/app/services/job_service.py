from datetime import datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.job import Job, JOB_STATUS_QUEUED


def _utcnow_naive() -> datetime:
    """Current UTC as naive datetime for DB comparison (DB columns are naive)."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


def get_queue_stats(db: Session) -> dict[str, int]:
    """Return counts of jobs in queued and processing (non-expired)."""
    now = _utcnow_naive()
    result = db.execute(
        select(Job.status, func.count(Job.id))
        .where(Job.expires_at > now, Job.status.in_(["queued", "processing"]))
        .group_by(Job.status)
    )
    counts = dict(result.all())
    return {"queued": counts.get("queued", 0), "processing": counts.get("processing", 0)}


def get_admin_stats(db: Session) -> dict[str, int]:
    """Return aggregate job counts by status (all time). For admin endpoint."""
    result = db.execute(
        select(Job.status, func.count(Job.id)).group_by(Job.status)
    )
    counts = dict(result.all())
    return {
        "queued": counts.get("queued", 0),
        "processing": counts.get("processing", 0),
        "completed": counts.get("completed", 0),
        "failed": counts.get("failed", 0),
        "cancelled": counts.get("cancelled", 0),
    }


def get_recent_jobs(db: Session, limit: int = 50) -> list[Job]:
    """Return recent jobs (not expired), newest first."""
    now = _utcnow_naive()
    result = db.execute(
        select(Job)
        .where(Job.expires_at > now)
        .order_by(Job.created_at.desc())
        .limit(limit)
    )
    return list(result.scalars().all())


def create_jobs(
    db: Session,
    filenames: list[str],
    scale: int,
    method: str,
    denoise_first: bool = False,
    face_enhance: bool = False,
    target_format: str | None = None,
    quality: int | None = None,
    options: dict | None = None,
) -> list[Job]:
    expires_at = _utcnow_naive() + timedelta(minutes=settings.job_expiry_minutes)
    jobs = []
    for filename in filenames:
        job = Job(
            status=JOB_STATUS_QUEUED,
            original_filename=filename,
            original_key="",
            result_key=None,
            scale=scale,
            method=method,
            denoise_first=denoise_first,
            face_enhance=face_enhance,
            expires_at=expires_at,
            target_format=target_format,
            quality=quality,
            options=options,
        )
        db.add(job)
        jobs.append(job)
    db.flush()
    for job in jobs:
        job.original_key = f"originals/{job.id}"
    db.commit()
    for j in jobs:
        db.refresh(j)
    return jobs


def create_multi_input_job(
    db: Session,
    filenames: list[str],
    method: str,
    scale: int = 1,
    denoise_first: bool = False,
    face_enhance: bool = False,
    target_format: str | None = None,
    quality: int | None = None,
    options: dict | None = None,
) -> Job:
    """Create a single job for multi-input methods (e.g. collage, image_to_pdf). Files stored at originals/{job_id}/0, 1, ..."""
    expires_at = _utcnow_naive() + timedelta(minutes=settings.job_expiry_minutes)
    opts = options or {}
    opts = {**opts, "_input_count": len(filenames)}
    display_name = filenames[0] if filenames else "output"
    job = Job(
        status=JOB_STATUS_QUEUED,
        original_filename=display_name,
        original_key="",
        result_key=None,
        scale=scale,
        method=method,
        denoise_first=denoise_first,
        face_enhance=face_enhance,
        expires_at=expires_at,
        target_format=target_format,
        quality=quality,
        options=opts,
    )
    db.add(job)
    db.flush()
    job.original_key = f"originals/{job.id}"
    db.commit()
    db.refresh(job)
    return job


def get_jobs_by_ids(db: Session, job_ids: list[UUID]) -> list[Job]:
    if not job_ids:
        return []
    result = db.execute(select(Job).where(Job.id.in_(job_ids)))
    return list(result.scalars().all())


def get_job_by_id(db: Session, job_id: UUID) -> Job | None:
    result = db.execute(select(Job).where(Job.id == job_id))
    return result.scalars().one_or_none()


def cancel_job(db: Session, job_id: UUID) -> Job | None:
    """Set job to cancelled if it is queued or processing. Returns the job or None."""
    job = get_job_by_id(db, job_id)
    if not job or job.status not in ("queued", "processing"):
        return None
    now = _utcnow_naive()
    job.status = "cancelled"
    job.error_message = "Cancelled by user"
    job.status_detail = None
    job.finished_at = now
    db.commit()
    db.refresh(job)
    return job

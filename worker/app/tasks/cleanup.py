from datetime import datetime, timedelta
from sqlalchemy import select, delete

from app.celery_app import celery_app
from app.db import get_db
from app.models.job import Job
from app.storage import get_storage

# Jobs stuck in "processing" longer than this are marked failed (worker likely OOM-killed)
STALE_PROCESSING_MINUTES = 30


@celery_app.task
def fail_stale_processing_task() -> None:
    """Mark jobs stuck in 'processing' for too long as failed (e.g. after worker OOM)."""
    db = get_db()
    try:
        cutoff = datetime.utcnow() - timedelta(minutes=STALE_PROCESSING_MINUTES)
        result = db.execute(
            select(Job).where(
                Job.status == "processing",
                Job.created_at < cutoff,
            )
        )
        jobs = list(result.scalars().all())
        if not jobs:
            return
        msg = (
            "Processing timed out. The worker may have run out of memory—try a smaller image or increase Docker memory."
        )
        now = datetime.utcnow()
        for job in jobs:
            job.status = "failed"
            job.error_message = msg
            job.status_detail = None
            job.finished_at = now
        db.commit()
    finally:
        db.close()


@celery_app.task
def cleanup_expired_task() -> None:
    db = get_db()
    try:
        result = db.execute(
            select(Job).where(Job.expires_at < datetime.utcnow())
        )
        jobs = list(result.scalars().all())
        if not jobs:
            return
        storage = get_storage()
        for job in jobs:
            try:
                storage.delete(job.original_key)
            except Exception:
                pass
            if job.result_key:
                try:
                    storage.delete(job.result_key)
                except Exception:
                    pass
        if jobs:
            db.execute(delete(Job).where(Job.id.in_([j.id for j in jobs])))
        db.commit()
    finally:
        db.close()

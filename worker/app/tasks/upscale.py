import logging
import os
import tempfile
from datetime import datetime
from pathlib import Path
from uuid import UUID

from sqlalchemy import select

from app.celery_app import celery_app
from app.config import settings
from app.db import get_db
from app.models.job import Job
from app.storage import get_storage

logger = logging.getLogger(__name__)

JOB_STATUS_QUEUED = "queued"
JOB_STATUS_PROCESSING = "processing"
JOB_STATUS_COMPLETED = "completed"
JOB_STATUS_FAILED = "failed"
JOB_STATUS_CANCELLED = "cancelled"


def _get_job(job_id: str) -> Job | None:
    db = get_db()
    try:
        result = db.execute(select(Job).where(Job.id == UUID(job_id)))
        return result.scalars().one_or_none()
    finally:
        db.close()


def _update_job_status(
    job_id: str,
    status: str,
    result_key: str | None = None,
    error_message: str | None = None,
    status_detail: str | None = None,
    started_at: datetime | None = None,
    finished_at: datetime | None = None,
) -> None:
    db = get_db()
    try:
        result = db.execute(select(Job).where(Job.id == UUID(job_id)))
        job = result.scalars().one_or_none()
        if job:
            job.status = status
            if result_key is not None:
                job.result_key = result_key
            if error_message is not None:
                job.error_message = error_message
            if status_detail is not None:
                job.status_detail = status_detail
            if started_at is not None:
                job.started_at = started_at
            if finished_at is not None:
                job.finished_at = finished_at
            db.commit()
    finally:
        db.close()


# Name must match backend celery_client.TASK_UPSCALE so tasks are received
@celery_app.task(name="app.tasks.upscale.upscale_task")
def upscale_task(job_id: str) -> None:
    logger.info("upscale_task started job_id=%s", job_id)
    job = _get_job(job_id)
    if not job or job.status != JOB_STATUS_QUEUED:
        logger.warning("upscale_task skipped job_id=%s (not found or not queued)", job_id)
        return

    now = datetime.utcnow()
    _update_job_status(job_id, JOB_STATUS_PROCESSING, status_detail="Starting…", started_at=now)
    storage = get_storage()

    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            tmp = Path(tmpdir)
            input_path = tmp / "input"
            output_path = tmp / "output.png"

            _update_job_status(job_id, JOB_STATUS_PROCESSING, status_detail="Downloading image…")
            logger.info("job_id=%s downloading from storage key=%s", job_id, job.original_key)
            storage.get_to_file(job.original_key, input_path)

            try:
                import cv2
                img = cv2.imread(str(input_path))
                if img is not None:
                    h, w = img.shape[:2]
                    mp = (h * w) / 1_000_000
                    if mp > settings.max_megapixels:
                        _update_job_status(
                            job_id,
                            JOB_STATUS_FAILED,
                            error_message=f"Image exceeds {settings.max_megapixels} megapixels",
                            finished_at=datetime.utcnow(),
                        )
                        return
            except Exception:
                pass

            if job.method == "swinir":
                swinir_dir = Path(os.environ.get("SWINIR_DIR", "/app/SwinIR"))
                if not swinir_dir.is_dir():
                    _update_job_status(
                        job_id,
                        JOB_STATUS_FAILED,
                        error_message="SwinIR is not available in this deployment (repo not found). Use Standard (Real-ESRGAN) or rebuild the worker image with SwinIR.",
                        finished_at=datetime.utcnow(),
                    )
                    logger.warning("job_id=%s SwinIR requested but repo not found at %s", job_id, swinir_dir)
                    return

            from app.pipeline import METHOD_BACKGROUND_REMOVE, UPSCALE_METHODS, run as pipeline_run

            method_labels = {
                "real_esrgan": "Real-ESRGAN",
                "swinir": "SwinIR",
                "esrgan": "ESRGAN (RRDB)",
                "real_esrgan_anime": "Anime (Real-ESRGAN)",
                "background_remove": "Background remove",
            }
            method_label = method_labels.get(job.method, job.method)
            if job.method == METHOD_BACKGROUND_REMOVE:
                detail = "Running Background remove…"
            else:
                detail = f"Running {method_label} ({job.scale}×) — may take several minutes…"
            _update_job_status(job_id, JOB_STATUS_PROCESSING, status_detail=detail)
            logger.info(
                "job_id=%s running pipeline method=%s scale=%s denoise=%s face_enhance=%s",
                job_id, job.method, job.scale,
                getattr(job, "denoise_first", False),
                getattr(job, "face_enhance", False),
            )

            if job.method not in UPSCALE_METHODS and job.method != METHOD_BACKGROUND_REMOVE:
                _update_job_status(
                    job_id,
                    JOB_STATUS_FAILED,
                    error_message=f"Unknown method: {job.method}",
                    finished_at=datetime.utcnow(),
                )
                return

            pipeline_run(job, input_path, output_path)

            # If user cancelled while we were processing, don't upload result
            job_after = _get_job(job_id)
            if job_after and job_after.status == JOB_STATUS_CANCELLED:
                logger.info("job_id=%s was cancelled, skipping upload", job_id)
                return

            _update_job_status(job_id, JOB_STATUS_PROCESSING, status_detail="Uploading result…")
            logger.info("job_id=%s uploading result", job_id)
            result_key = f"results/{job_id}"
            with open(output_path, "rb") as f:
                storage.put(result_key, f)

            _update_job_status(
                job_id,
                JOB_STATUS_COMPLETED,
                result_key=result_key,
                status_detail=None,
                finished_at=datetime.utcnow(),
            )
            logger.info("job_id=%s completed", job_id)

    except Exception as e:
        logger.exception("job_id=%s failed: %s", job_id, e)
        msg = str(e)
        if "SwinIR repo not found" in msg or "SwinIR" in msg and "not available" in msg:
            msg = (
                "SwinIR is not available in this deployment (repo not found). "
                "Use Standard (Real-ESRGAN), or rebuild the worker image with: "
                "docker compose build --no-cache worker && docker compose up -d worker"
            )
        _update_job_status(
            job_id,
            JOB_STATUS_FAILED,
            error_message=msg,
            status_detail=None,
            finished_at=datetime.utcnow(),
        )

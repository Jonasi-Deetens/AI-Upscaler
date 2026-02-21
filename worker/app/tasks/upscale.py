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
    progress: int | None = None,
    clear_progress: bool = False,
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
            if clear_progress:
                job.progress = None
            elif progress is not None:
                job.progress = progress
            db.commit()
    finally:
        db.close()


# Name must match backend celery_client.TASK_UPSCALE so tasks are received.
# Task always returns (never re-raises); Celery acks the message so the next job in the queue runs.
@celery_app.task(name="app.tasks.upscale.upscale_task")
def upscale_task(job_id: str) -> None:
    logger.info("upscale_task started job_id=%s", job_id)
    job = _get_job(job_id)
    if not job or job.status != JOB_STATUS_QUEUED:
        logger.warning("upscale_task skipped job_id=%s (not found or not queued)", job_id)
        return

    now = datetime.utcnow()
    _update_job_status(
        job_id, JOB_STATUS_PROCESSING, status_detail="Starting…", started_at=now, progress=5
    )
    storage = get_storage()

    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            tmp = Path(tmpdir)
            opts = getattr(job, "options", None) or {}
            multi_count = opts.get("_input_count", 1)
            # Multi-input jobs store files at originals/{job_id}/0, 1, ... (original_key is the dir)
            is_multi_input = "_input_count" in opts

            if is_multi_input:
                _update_job_status(
                    job_id, JOB_STATUS_PROCESSING, status_detail="Downloading images…", progress=15
                )
                for i in range(multi_count):
                    key = f"originals/{job_id}/{i}"
                    storage.get_to_file(key, tmp / str(i))
                input_path = tmp
                if job.method == "image_to_pdf":
                    output_path = tmp / "output.pdf"
                elif job.method == "pdf_merge_split":
                    output_path = tmp / "output.zip" if opts.get("action") == "split" else tmp / "output.pdf"
                else:
                    output_path = tmp / "output.png"
            else:
                input_path = tmp / "input"
                if job.method == "compress_pdf":
                    output_path = tmp / "output.pdf"
                elif job.method == "ocr":
                    output_path = tmp / "output.txt"
                elif job.method == "heic_to_jpg":
                    output_path = tmp / "output.jpg"
                elif job.method == "favicon":
                    output_path = tmp / "output.ico"
                else:
                    output_path = tmp / "output.png"
                _update_job_status(
                    job_id, JOB_STATUS_PROCESSING, status_detail="Downloading image…", progress=15
                )
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
                                clear_progress=True,
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
                        clear_progress=True,
                    )
                    logger.warning("job_id=%s SwinIR requested but repo not found at %s", job_id, swinir_dir)
                    return

            from app.pipeline import METHOD_RUNNERS, run as pipeline_run

            method_labels = {
                "real_esrgan": "Real-ESRGAN",
                "swinir": "SwinIR",
                "esrgan": "ESRGAN (RRDB)",
                "real_esrgan_anime": "Anime (Real-ESRGAN)",
                "background_remove": "Background remove",
                "convert": "Convert",
                "compress": "Compress",
                "restore": "Restore & colorize",
                "resize": "Resize",
                "rotate_flip": "Rotate & flip",
                "crop": "Crop",
                "strip_metadata": "Strip metadata",
                "denoise": "Denoise",
                "blur_sharpen": "Blur / Sharpen",
                "brightness_contrast": "Brightness & contrast",
                "watermark": "Watermark",
                "rename": "Rename",
                "auto_levels": "Auto levels",
                "saturation": "Saturation",
                "color_balance": "Color balance",
                "filters": "Filters",
                "border": "Border",
                "collage": "Collage",
                "image_to_pdf": "Image to PDF",
                "vignette": "Vignette",
                "tilt_shift": "Tilt-shift",
                "pixelate": "Pixelate",
                "smart_crop": "Smart crop",
                "background_blur": "Portrait blur",
                "inpaint": "Inpaint",
                "pdf_merge_split": "PDF merge/split",
                "compress_pdf": "Compress PDF",
                "heic_to_jpg": "HEIC to JPG",
                "svg_to_png": "SVG to PNG",
                "favicon": "Favicon generator",
                "ocr": "OCR",
            }
            method_label = method_labels.get(job.method, job.method)
            if job.method == "convert":
                detail = f"Converting to {getattr(job, 'target_format', 'png')}…"
            elif job.method == "compress":
                detail = f"Compressing to {getattr(job, 'target_format', 'webp')}…"
            elif job.method == "background_remove":
                detail = "Running Background remove…"
            elif job.method == "restore":
                detail = "Running Restore & colorize…"
            elif job.method == "resize":
                detail = "Resizing…"
            elif job.method == "rotate_flip":
                detail = "Rotating & flipping…"
            elif job.method == "crop":
                detail = "Cropping…"
            elif job.method == "strip_metadata":
                detail = "Stripping metadata…"
            elif job.method == "denoise":
                detail = "Denoising…"
            elif job.method == "ocr":
                detail = "Running OCR…"
            else:
                detail = f"Running {method_label} ({job.scale}×) — may take several minutes…"
            _update_job_status(job_id, JOB_STATUS_PROCESSING, status_detail=detail, progress=25)
            logger.info(
                "job_id=%s running pipeline method=%s scale=%s denoise=%s face_enhance=%s",
                job_id, job.method, job.scale,
                getattr(job, "denoise_first", False),
                getattr(job, "face_enhance", False),
            )

            if job.method not in METHOD_RUNNERS:
                _update_job_status(
                    job_id,
                    JOB_STATUS_FAILED,
                    error_message=f"Unknown method: {job.method}",
                    finished_at=datetime.utcnow(),
                    clear_progress=True,
                )
                return

            _update_job_status(job_id, JOB_STATUS_PROCESSING, status_detail=detail, progress=50)
            pipeline_run(job, input_path, output_path)
            _update_job_status(job_id, JOB_STATUS_PROCESSING, progress=75)

            # If user cancelled while we were processing, don't upload result
            job_after = _get_job(job_id)
            if job_after and job_after.status == JOB_STATUS_CANCELLED:
                logger.info("job_id=%s was cancelled, skipping upload", job_id)
                return

            _update_job_status(
                job_id, JOB_STATUS_PROCESSING, status_detail="Uploading result…", progress=90
            )
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
                progress=100,
            )
            logger.info("job_id=%s completed", job_id)

    except Exception as e:
        logger.exception("job_id=%s failed: %s", job_id, e)
        job_after = _get_job(job_id)
        if job_after and job_after.status == JOB_STATUS_CANCELLED:
            logger.info("job_id=%s was cancelled, not overwriting with failed", job_id)
            return
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
            clear_progress=True,
        )
        # Return normally so Celery acks this task and the next job in the queue runs.

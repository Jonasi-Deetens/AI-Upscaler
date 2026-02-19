import logging
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from uuid import UUID
from io import BytesIO

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request
from fastapi.responses import FileResponse, RedirectResponse, Response
from sqlalchemy.orm import Session
from PIL import Image

logger = logging.getLogger(__name__)
from app.core.config import settings
from app.core.database import get_db
from app.core.rate_limit import check_upload_rate_limit, check_download_rate_limit
from app.core.storage import get_storage
from app.models.job import JOB_STATUS_COMPLETED
from app.core.celery_client import celery_app, enqueue_upscale
from app.schemas.job import JobResponse, UploadResponse
from app.services import job_service
from app.api.method_handlers import (
    ALLOWED_METHODS,
    get_download_info,
    parse_options_form,
    validate_upload,
)

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


def _job_to_response(request: Request, job) -> JobResponse:
    base = str(request.base_url).rstrip("/")
    result_url = None
    if job.status == JOB_STATUS_COMPLETED and job.result_key:
        result_url = f"{base}/api/jobs/{job.id}/download"
    original_url = None
    if job.original_key:
        original_url = f"{base}/api/jobs/{job.id}/original"
    thumbnail_url = f"{base}/api/jobs/{job.id}/thumbnail" if job.original_key else None
    return JobResponse(
        id=job.id,
        status=job.status,
        original_filename=job.original_filename,
        original_key=job.original_key or None,
        result_key=job.result_key,
        result_url=result_url,
        original_url=original_url,
        thumbnail_url=thumbnail_url,
        scale=job.scale,
        method=job.method,
        denoise_first=getattr(job, "denoise_first", False),
        face_enhance=getattr(job, "face_enhance", False),
        created_at=job.created_at,
        expires_at=job.expires_at,
        started_at=getattr(job, "started_at", None),
        finished_at=getattr(job, "finished_at", None),
        error_message=job.error_message,
        status_detail=getattr(job, "status_detail", None),
        progress=getattr(job, "progress", None),
        target_format=getattr(job, "target_format", None),
        quality=getattr(job, "quality", None),
        options=getattr(job, "options", None),
    )


@router.post("/upload", response_model=UploadResponse)
def upload_jobs(
    request: Request,
    files: list[UploadFile] = File(...),
    scale: int = Form(4),
    method: str = Form("real_esrgan"),
    denoise_first: str = Form("false"),
    face_enhance: str = Form("false"),
    target_format: str | None = Form(None),
    quality: str | None = Form(None),
    options: str | None = Form(None),
    db: Session = Depends(get_db),
) -> UploadResponse:
    check_upload_rate_limit(request)
    if len(files) > settings.max_files_per_batch:
        raise HTTPException(
            400,
            detail=f"Too many files. Max {settings.max_files_per_batch} per batch.",
        )
    options_parsed = parse_options_form(options)
    scale, job_kwargs = validate_upload(
        method=method,
        scale=scale,
        denoise_first=denoise_first.lower() == "true",
        face_enhance=face_enhance.lower() == "true",
        target_format=target_format,
        quality=quality,
        options=options_parsed,
    )

    valid: list[tuple[str, UploadFile]] = []
    max_bytes = settings.max_mb_per_file * 1024 * 1024
    max_pixels = settings.max_megapixels * 1_000_000
    for f in files:
        if not f.filename:
            continue
        content = f.file.read()
        if len(content) > max_bytes:
            raise HTTPException(
                400,
                detail=f"File {f.filename} exceeds {settings.max_mb_per_file} MB.",
            )
        try:
            img = Image.open(BytesIO(content))
            w, h = img.size
            if w * h > max_pixels:
                raise HTTPException(
                    400,
                    detail=f"File {f.filename} exceeds {settings.max_megapixels} megapixels.",
                )
        except HTTPException:
            raise
        except Exception:
            pass
        f.file.seek(0)
        valid.append((f.filename, f))

    if not valid:
        raise HTTPException(400, detail="No valid files")

    filenames = [v[0] for v in valid]
    storage = get_storage()

    MULTI_INPUT_METHODS = ("collage", "image_to_pdf", "inpaint")
    if method in MULTI_INPUT_METHODS:
        job = job_service.create_multi_input_job(
            db,
            filenames,
            method=method,
            scale=scale,
            denoise_first=job_kwargs["denoise_first"],
            face_enhance=job_kwargs["face_enhance"],
            target_format=job_kwargs.get("target_format"),
            quality=job_kwargs.get("quality"),
            options=job_kwargs.get("options"),
        )
        for i, (_, upload_file) in enumerate(valid):
            storage.put(f"originals/{job.id}/{i}", upload_file.file)
        task_id = enqueue_upscale(job.id)
        if task_id:
            job.celery_task_id = task_id
        db.commit()
        logger.info("Upload created multi-input job_id=%s", job.id)
        return UploadResponse(job_ids=[job.id])

    jobs = job_service.create_jobs(
        db,
        filenames,
        scale=scale,
        method=method,
        denoise_first=job_kwargs["denoise_first"],
        face_enhance=job_kwargs["face_enhance"],
        target_format=job_kwargs.get("target_format"),
        quality=job_kwargs.get("quality"),
        options=job_kwargs.get("options"),
    )
    for job, (_, upload_file) in zip(jobs, valid):
        storage.put(job.original_key, upload_file.file)

    for job in jobs:
        task_id = enqueue_upscale(job.id)
        if task_id:
            job.celery_task_id = task_id
    db.commit()
    logger.info(
        "Upload created %s jobs",
        len(jobs),
        extra={"job_id": str(jobs[0].id) if jobs else ""},
    )
    return UploadResponse(job_ids=[j.id for j in jobs])


@router.get("/batch-download")
def batch_download(
    request: Request,
    ids: str,
    db: Session = Depends(get_db),
) -> Response:
    """Stream a ZIP of all completed, non-expired job results."""
    check_download_rate_limit(request)
    import zipfile

    if not ids or not ids.strip():
        raise HTTPException(400, detail="ids required (comma-separated job IDs)")
    job_ids = [UUID(x.strip()) for x in ids.split(",") if x.strip()]
    jobs = job_service.get_jobs_by_ids(db, job_ids)
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    to_zip = [
        j for j in jobs
        if j.status == JOB_STATUS_COMPLETED and j.result_key and j.expires_at > now
    ]
    if not to_zip:
        raise HTTPException(404, detail="No completed, non-expired results to download")

    storage = get_storage()
    buf = BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for job in to_zip:
            with tempfile.NamedTemporaryFile(delete=False) as tmp:
                try:
                    storage.get_to_file(job.result_key, Path(tmp.name))
                    arcname, _ = get_download_info(job)
                    zf.write(tmp.name, arcname=arcname)
                finally:
                    Path(tmp.name).unlink(missing_ok=True)
    buf.seek(0)
    from fastapi.responses import StreamingResponse
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=upscaled_batch.zip"},
    )


@router.post("/{job_id}/cancel", response_model=JobResponse)
def cancel_job_endpoint(
    request: Request,
    job_id: UUID,
    db: Session = Depends(get_db),
) -> JobResponse:
    job = job_service.get_job_by_id(db, job_id)
    if not job:
        raise HTTPException(404, detail="Job not found")
    if job.status not in ("queued", "processing"):
        raise HTTPException(
            400,
            detail="Job cannot be cancelled (not found or already completed/failed/cancelled)",
        )
    task_id = getattr(job, "celery_task_id", None)
    if task_id:
        try:
            celery_app.control.revoke(task_id, terminate=True, signal="SIGTERM")
        except Exception as e:
            logger.warning(
                "revoke task_id=%s failed: %s",
                task_id,
                e,
                extra={"job_id": str(job_id)},
            )
    job = job_service.cancel_job(db, job_id)
    logger.info("Job cancelled", extra={"job_id": str(job_id)})
    return _job_to_response(request, job)


@router.get("/{job_id}/download")
def download_result(
    request: Request,
    job_id: UUID,
    db: Session = Depends(get_db),
) -> FileResponse:
    check_download_rate_limit(request)
    job = job_service.get_job_by_id(db, job_id)
    if not job:
        raise HTTPException(404, detail="Job not found")
    if job.status != JOB_STATUS_COMPLETED or not job.result_key:
        raise HTTPException(404, detail="Result not available")
    if job.expires_at < datetime.now(timezone.utc).replace(tzinfo=None):
        raise HTTPException(410, detail="Result expired")
    storage = get_storage()
    url_or_path = storage.get_url(job.result_key)
    download_name, media_type = get_download_info(job)
    if url_or_path.startswith("http://") or url_or_path.startswith("https://"):
        return RedirectResponse(url=url_or_path, status_code=302)
    return FileResponse(url_or_path, filename=download_name, media_type=media_type)


@router.get("/{job_id}/original")
def serve_original(
    job_id: UUID,
    db: Session = Depends(get_db),
) -> FileResponse:
    """Serve the original uploaded image (for before/after comparison)."""
    job = job_service.get_job_by_id(db, job_id)
    if not job or not job.original_key:
        raise HTTPException(404, detail="Original not available")
    storage = get_storage()
    url_or_path = storage.get_url(job.original_key)
    if url_or_path.startswith("http://") or url_or_path.startswith("https://"):
        return RedirectResponse(url=url_or_path, status_code=302)
    return FileResponse(url_or_path, filename=job.original_filename)


@router.get("/{job_id}/thumbnail")
def serve_thumbnail(
    job_id: UUID,
    db: Session = Depends(get_db),
) -> Response:
    """Serve a small thumbnail of the original image."""
    job = job_service.get_job_by_id(db, job_id)
    if not job or not job.original_key:
        raise HTTPException(404, detail="Thumbnail not available")
    storage = get_storage()
    with tempfile.NamedTemporaryFile(suffix=Path(job.original_filename).suffix or ".png", delete=False) as tmp:
        try:
            storage.get_to_file(job.original_key, Path(tmp.name))
            img = Image.open(tmp.name).convert("RGB")
            img.thumbnail((120, 120), Image.Resampling.LANCZOS)
            buf = BytesIO()
            img.save(buf, format="JPEG", quality=85)
            buf.seek(0)
            return Response(content=buf.getvalue(), media_type="image/jpeg")
        finally:
            Path(tmp.name).unlink(missing_ok=True)


@router.post("/{job_id}/retry", response_model=JobResponse)
def retry_job_endpoint(
    request: Request,
    job_id: UUID,
    db: Session = Depends(get_db),
) -> JobResponse:
    """Create a new job with the same input and options as the failed job."""
    job = job_service.get_job_by_id(db, job_id)
    if not job:
        raise HTTPException(404, detail="Job not found")
    if job.status != "failed":
        raise HTTPException(400, detail="Only failed jobs can be retried")
    if not job.original_key:
        raise HTTPException(400, detail="Original file not available for retry")

    new_jobs = job_service.create_jobs(
        db,
        [job.original_filename],
        scale=job.scale,
        method=job.method,
        denoise_first=job.denoise_first,
        face_enhance=job.face_enhance,
        target_format=getattr(job, "target_format", None),
        quality=getattr(job, "quality", None),
        options=getattr(job, "options", None),
    )
    new_job = new_jobs[0]
    storage = get_storage()
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        try:
            storage.get_to_file(job.original_key, Path(tmp.name))
            with open(tmp.name, "rb") as f:
                storage.put(new_job.original_key, f)
        finally:
            Path(tmp.name).unlink(missing_ok=True)
    enqueue_upscale(new_job.id)
    logger.info(
        "Job retry created",
        extra={"job_id": str(new_job.id)},
    )
    return _job_to_response(request, new_job)


@router.get("/queue-stats")
def queue_stats(db: Session = Depends(get_db)):
    """Return counts of queued and processing jobs (for queue hint in UI)."""
    return job_service.get_queue_stats(db)


@router.get("", response_model=list[JobResponse])
def list_jobs(
    request: Request,
    ids: str | None = None,
    limit: int = 50,
    db: Session = Depends(get_db),
) -> list[JobResponse]:
    try:
        if ids:
            job_ids = [UUID(x.strip()) for x in ids.split(",") if x.strip()]
            jobs = job_service.get_jobs_by_ids(db, job_ids)
            logger.info(
                "list_jobs by ids count=%s",
                len(jobs),
                extra={"path": request.url.path},
            )
        else:
            jobs = job_service.get_recent_jobs(db, limit=min(limit, 100))
            logger.info(
                "list_jobs recent count=%s",
                len(jobs),
                extra={"path": request.url.path},
            )
        return [_job_to_response(request, j) for j in jobs]
    except Exception as e:
        logger.exception("list_jobs failed: %s", e)
        raise

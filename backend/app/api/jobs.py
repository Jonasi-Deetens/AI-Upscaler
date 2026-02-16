import logging
from datetime import datetime
from uuid import UUID
from io import BytesIO

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from PIL import Image

logger = logging.getLogger(__name__)
from app.core.config import settings
from app.core.database import get_db
from app.core.storage import get_storage
from app.models.job import JOB_STATUS_COMPLETED
from app.core.celery_client import enqueue_upscale
from app.schemas.job import JobResponse, UploadResponse
from app.services import job_service

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


def _job_to_response(request: Request, job) -> JobResponse:
    result_url = None
    if job.status == JOB_STATUS_COMPLETED and job.result_key:
        base = str(request.base_url).rstrip("/")
        result_url = f"{base}/api/jobs/{job.id}/download"
    return JobResponse(
        id=job.id,
        status=job.status,
        original_filename=job.original_filename,
        result_key=job.result_key,
        result_url=result_url,
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
    )


ALLOWED_METHODS = (
    "real_esrgan",
    "swinir",
    "esrgan",
    "real_esrgan_anime",
    "background_remove",
)


@router.post("/upload", response_model=UploadResponse)
def upload_jobs(
    request: Request,
    files: list[UploadFile] = File(...),
    scale: int = Form(4),
    method: str = Form("real_esrgan"),
    denoise_first: str = Form("false"),
    face_enhance: str = Form("false"),
    db: Session = Depends(get_db),
) -> UploadResponse:
    if len(files) > settings.max_files_per_batch:
        raise HTTPException(
            400,
            detail=f"Too many files. Max {settings.max_files_per_batch} per batch.",
        )
    if method not in ALLOWED_METHODS:
        raise HTTPException(400, detail=f"method must be one of: {', '.join(ALLOWED_METHODS)}")
    if method == "background_remove":
        if scale != 1:
            raise HTTPException(400, detail="scale must be 1 for background remove")
    elif scale not in (2, 4):
        raise HTTPException(400, detail="scale must be 2 or 4")

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
    jobs = job_service.create_jobs(
        db,
        filenames,
        scale=scale,
        method=method,
        denoise_first=denoise_first.lower() == "true",
        face_enhance=face_enhance.lower() == "true",
    )
    storage = get_storage()
    for job, (_, upload_file) in zip(jobs, valid):
        storage.put(job.original_key, upload_file.file)

    for job in jobs:
        enqueue_upscale(job.id)

    return UploadResponse(job_ids=[j.id for j in jobs])


@router.post("/{job_id}/cancel", response_model=JobResponse)
def cancel_job_endpoint(
    request: Request,
    job_id: UUID,
    db: Session = Depends(get_db),
) -> JobResponse:
    job = job_service.cancel_job(db, job_id)
    if not job:
        raise HTTPException(
            400,
            detail="Job cannot be cancelled (not found or already completed/failed/cancelled)",
        )
    return _job_to_response(request, job)


@router.get("/{job_id}/download")
def download_result(
    job_id: UUID,
    db: Session = Depends(get_db),
) -> FileResponse:
    job = job_service.get_job_by_id(db, job_id)
    if not job:
        raise HTTPException(404, detail="Job not found")
    if job.status != JOB_STATUS_COMPLETED or not job.result_key:
        raise HTTPException(404, detail="Result not available")
    if job.expires_at < datetime.utcnow():
        raise HTTPException(410, detail="Result expired")
    storage = get_storage()
    path = storage.get_url(job.result_key)
    base, _ = job.original_filename.rsplit(".", 1) if "." in job.original_filename else (job.original_filename, "")
    download_name = f"{base}_upscaled.png"
    return FileResponse(path, filename=download_name, media_type="image/png")


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
            logger.info("list_jobs by ids count=%s", len(jobs))
        else:
            jobs = job_service.get_recent_jobs(db, limit=min(limit, 100))
            logger.info("list_jobs recent count=%s", len(jobs))
        return [_job_to_response(request, j) for j in jobs]
    except Exception as e:
        logger.exception("list_jobs failed: %s", e)
        raise

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class JobCreate(BaseModel):
    scale: int
    method: str


class JobResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    status: str
    original_filename: str
    result_key: str | None
    result_url: str | None
    original_url: str | None = None
    thumbnail_url: str | None = None
    scale: int
    method: str
    denoise_first: bool = False
    face_enhance: bool = False
    created_at: datetime
    expires_at: datetime
    started_at: datetime | None
    finished_at: datetime | None
    error_message: str | None
    status_detail: str | None
    progress: int | None = None  # 0-100 when processing


class UploadResponse(BaseModel):
    job_ids: list[UUID]

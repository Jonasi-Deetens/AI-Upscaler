import io
import uuid
from unittest.mock import MagicMock, patch

import pytest
from PIL import Image


def test_list_jobs_empty(client):
    """GET /api/jobs returns 200 and an array."""
    with patch("app.api.jobs.job_service.get_recent_jobs", return_value=[]):
        r = client.get("/api/jobs")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)


def test_list_jobs_with_limit(client):
    """GET /api/jobs?limit=5 returns 200 and array of at most 5."""
    with patch("app.api.jobs.job_service.get_recent_jobs", return_value=[]):
        r = client.get("/api/jobs?limit=5")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) <= 5


def test_queue_stats(client):
    """GET /api/jobs/queue-stats returns queued and processing counts."""
    with patch(
        "app.api.jobs.job_service.get_queue_stats",
        return_value={"queued": 0, "processing": 0},
    ):
        r = client.get("/api/jobs/queue-stats")
    assert r.status_code == 200
    data = r.json()
    assert "queued" in data
    assert "processing" in data
    assert isinstance(data["queued"], int)
    assert isinstance(data["processing"], int)


def test_upload_rejects_too_many_files(client):
    """POST /api/jobs/upload with more than max files returns 400."""
    buf = io.BytesIO()
    Image.new("RGB", (10, 10), color="red").save(buf, format="PNG")
    buf.seek(0)
    files = [("files", ("img.png", buf.getvalue(), "image/png"))] * 11

    with patch("app.api.jobs.settings") as mock_settings:
        mock_settings.max_files_per_batch = 2
        mock_settings.max_mb_per_file = 50
        mock_settings.max_megapixels = 16
        r = client.post(
            "/api/jobs/upload",
            data={"scale": 4, "method": "real_esrgan", "denoise_first": "false", "face_enhance": "false"},
            files=files,
        )
    assert r.status_code == 400
    assert "detail" in r.json()


def test_upload_rejects_oversized_file(client):
    """POST /api/jobs/upload with file exceeding size limit returns 400."""
    buf = io.BytesIO()
    Image.new("RGB", (100, 100), color="red").save(buf, format="PNG")
    buf.seek(0)
    content = buf.getvalue()
    files = [("files", ("img.png", content, "image/png"))]

    with patch("app.api.jobs.settings") as mock_settings:
        mock_settings.max_files_per_batch = 10
        mock_settings.max_mb_per_file = 0.0001  # ~100 bytes; PNG is larger
        mock_settings.max_megapixels = 16
        r = client.post(
            "/api/jobs/upload",
            data={"scale": 4, "method": "real_esrgan", "denoise_first": "false", "face_enhance": "false"},
            files=files,
        )
    assert r.status_code == 400
    assert "detail" in r.json()


def test_upload_rate_limit_returns_429_after_limit(client):
    """POST /api/jobs/upload returns 429 after rate limit exceeded."""
    from app.core import rate_limit
    original_limit = rate_limit.UPLOADS_PER_MINUTE
    rate_limit.UPLOADS_PER_MINUTE = 1
    rate_limit._upload_times.clear()

    fake_id = uuid.uuid4()
    fake_job = MagicMock()
    fake_job.id = fake_id
    fake_job.original_key = f"originals/{fake_id}"
    fake_job.celery_task_id = None
    mock_storage = MagicMock()

    try:
        buf = io.BytesIO()
        Image.new("RGB", (10, 10), color="red").save(buf, format="PNG")
        raw = buf.getvalue()
        files = [("files", ("img.png", raw, "image/png"))]
        payload = {"scale": 4, "method": "real_esrgan", "denoise_first": "false", "face_enhance": "false"}

        with (
            patch("app.api.jobs.job_service.create_jobs", return_value=[fake_job]),
            patch("app.api.jobs.get_storage", return_value=mock_storage),
            patch("app.api.jobs.enqueue_upscale", return_value=None),
        ):
            client.post("/api/jobs/upload", data=payload, files=files)
            r = client.post("/api/jobs/upload", data=payload, files=files)
        assert r.status_code == 429
        assert "detail" in r.json()
    finally:
        rate_limit.UPLOADS_PER_MINUTE = original_limit
        rate_limit._upload_times.clear()


def test_download_404_for_nonexistent_job(client):
    """GET /api/jobs/{id}/download returns 404 for non-existent job."""
    with patch("app.api.jobs.job_service.get_job_by_id", return_value=None):
        r = client.get("/api/jobs/00000000-0000-0000-0000-000000000001/download")
    assert r.status_code == 404
    data = r.json()
    assert "detail" in data
    assert "not found" in data["detail"].lower() or "result" in data["detail"].lower()


def test_retry_404_for_nonexistent_job(client):
    """POST /api/jobs/{id}/retry returns 404 for non-existent job."""
    with patch("app.api.jobs.job_service.get_job_by_id", return_value=None):
        r = client.post("/api/jobs/00000000-0000-0000-0000-000000000001/retry")
    assert r.status_code == 404
    data = r.json()
    assert "detail" in data


def test_batch_download_400_when_ids_empty(client):
    """GET /api/jobs/batch-download with empty ids returns 400."""
    r = client.get("/api/jobs/batch-download?ids=")
    assert r.status_code == 400
    data = r.json()
    assert "detail" in data


def test_batch_download_404_when_no_completed_results(client):
    """GET /api/jobs/batch-download returns 404 when no completed, non-expired jobs."""
    with patch("app.api.jobs.job_service.get_jobs_by_ids", return_value=[]):
        r = client.get(
            "/api/jobs/batch-download?ids=00000000-0000-0000-0000-000000000001"
        )
    assert r.status_code == 404
    data = r.json()
    assert "detail" in data

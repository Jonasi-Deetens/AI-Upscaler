import time
from collections import defaultdict

from fastapi import HTTPException, Request

_upload_times: dict[str, list[float]] = defaultdict(list)
_download_times: dict[str, list[float]] = defaultdict(list)

UPLOADS_PER_MINUTE = 10
DOWNLOADS_PER_MINUTE = 30
WINDOW_SECONDS = 60.0


def _client_key(request: Request) -> str:
    client = request.client
    return client.host if client else "unknown"


def check_upload_rate_limit(request: Request) -> None:
    """Raise 429 if the client has exceeded upload rate limit."""
    key = _client_key(request)
    now = time.time()
    _upload_times[key] = [t for t in _upload_times[key] if now - t < WINDOW_SECONDS]
    if len(_upload_times[key]) >= UPLOADS_PER_MINUTE:
        raise HTTPException(
            status_code=429,
            detail="Too many uploads. Try again in a few minutes.",
        )
    _upload_times[key].append(now)


def check_download_rate_limit(request: Request) -> None:
    """Raise 429 if the client has exceeded download/batch-download rate limit."""
    key = _client_key(request)
    now = time.time()
    _download_times[key] = [t for t in _download_times[key] if now - t < WINDOW_SECONDS]
    if len(_download_times[key]) >= DOWNLOADS_PER_MINUTE:
        raise HTTPException(
            status_code=429,
            detail="Too many download requests. Try again in a minute.",
        )
    _download_times[key].append(now)

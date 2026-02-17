import time
from collections import defaultdict

from fastapi import HTTPException, Request

_upload_times: dict[str, list[float]] = defaultdict(list)
UPLOADS_PER_MINUTE = 10
WINDOW_SECONDS = 60.0


def check_upload_rate_limit(request: Request) -> None:
    """Raise 429 if the client has exceeded upload rate limit."""
    client = request.client
    key = client.host if client else "unknown"
    now = time.time()
    _upload_times[key] = [t for t in _upload_times[key] if now - t < WINDOW_SECONDS]
    if len(_upload_times[key]) >= UPLOADS_PER_MINUTE:
        raise HTTPException(
            status_code=429,
            detail="Too many uploads. Try again in a few minutes.",
        )
    _upload_times[key].append(now)

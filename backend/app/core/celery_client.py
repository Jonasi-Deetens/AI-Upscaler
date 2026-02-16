from celery import Celery

from app.core.config import settings

celery_app = Celery(
    "backend",
    broker=settings.celery_broker_url,
    backend=settings.redis_url,
)

TASK_UPSCALE = "app.tasks.upscale.upscale_task"


def enqueue_upscale(job_id: str) -> str | None:
    """Enqueue upscale task; returns Celery task_id for revoke on cancel."""
    result = celery_app.send_task(TASK_UPSCALE, args=[str(job_id)])
    return result.id if result else None

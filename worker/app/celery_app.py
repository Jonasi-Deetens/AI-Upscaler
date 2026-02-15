from celery import Celery

from app.config import settings

celery_app = Celery(
    "worker",
    broker=settings.celery_broker_url,
    backend=settings.redis_url,
)
celery_app.conf.task_default_queue = "celery"
celery_app.autodiscover_tasks(["app.tasks"])
celery_app.conf.beat_schedule = {
    "cleanup-expired": {
        "task": "app.tasks.cleanup.cleanup_expired_task",
        "schedule": 300.0,
    },
    "fail-stale-processing": {
        "task": "app.tasks.cleanup.fail_stale_processing_task",
        "schedule": 300.0,  # every 5 min
    },
}

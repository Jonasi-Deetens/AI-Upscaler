from app.tasks.cleanup import fail_stale_processing_task  # noqa: F401 - beat schedule
from app.tasks.upscale import upscale_task
from app.tasks.cleanup import cleanup_expired_task

__all__ = ["upscale_task", "cleanup_expired_task"]

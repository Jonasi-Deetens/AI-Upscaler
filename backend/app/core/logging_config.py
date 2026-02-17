"""Structured JSON logging: one JSON object per line with timestamp, level, message, request_id, path."""
import json
import logging
import sys
from datetime import datetime, timezone


class RequestContextFilter(logging.Filter):
    """Add request_id from context var to log records."""

    def filter(self, record: logging.LogRecord) -> bool:
        from app.core.request_context import request_id_var

        try:
            record.request_id = request_id_var.get() or ""
        except LookupError:
            record.request_id = ""
        if not hasattr(record, "path"):
            record.path = ""
        if not hasattr(record, "job_id"):
            record.job_id = ""
        return True


class JsonLogFormatter(logging.Formatter):
    """Format log records as a single JSON line per record."""

    def format(self, record: logging.LogRecord) -> str:
        log_obj = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
        }
        if getattr(record, "request_id", ""):
            log_obj["request_id"] = record.request_id
        if getattr(record, "path", ""):
            log_obj["path"] = record.path
        if getattr(record, "job_id", ""):
            log_obj["job_id"] = record.job_id
        if record.exc_info:
            log_obj["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_obj)


def configure_structured_logging() -> None:
    """Configure root logger to emit JSON lines to stdout with request context."""
    root = logging.getLogger()
    root.setLevel(logging.INFO)
    for h in list(root.handlers):
        root.removeHandler(h)
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(logging.INFO)
    handler.addFilter(RequestContextFilter())
    handler.setFormatter(JsonLogFormatter())
    root.addHandler(handler)

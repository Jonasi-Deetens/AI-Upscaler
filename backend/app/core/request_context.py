"""Context variables for request-scoped data (e.g. request_id) used in structured logging."""
import contextvars

request_id_var: contextvars.ContextVar[str | None] = contextvars.ContextVar(
    "request_id", default=None
)

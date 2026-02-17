import logging
import os
import traceback
import uuid
from contextlib import asynccontextmanager

import redis
from alembic import command
from alembic.config import Config
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from starlette.middleware.base import BaseHTTPMiddleware

from app.api import admin, jobs
from app.core.config import settings
from app.core.database import engine
from app.core.logging_config import configure_structured_logging
from app.core.request_context import request_id_var

configure_structured_logging()
logger = logging.getLogger(__name__)


class RequestIdMiddleware(BaseHTTPMiddleware):
    """Assign request_id to each request; attach to state and context; log request/response."""

    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        token = request_id_var.set(request_id)
        try:
            logger.info(
                "%s %s",
                request.method,
                request.url.path,
                extra={"path": request.url.path},
            )
            response = await call_next(request)
            logger.info(
                "%s %s -> %s",
                request.method,
                request.url.path,
                response.status_code,
                extra={"path": request.url.path},
            )
            return response
        finally:
            request_id_var.reset(token)


def run_migrations() -> None:
    """Run Alembic migrations to head. Uses same DATABASE_URL as the app."""
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    alembic_cfg = Config(os.path.join(backend_dir, "alembic.ini"))
    command.upgrade(alembic_cfg, "head")


@asynccontextmanager
async def lifespan(app: FastAPI):
    run_migrations()
    yield


app = FastAPI(title="AI Upscaler API", version="0.1.0", lifespan=lifespan)


@app.exception_handler(Exception)
def unhandled_exception_handler(request, exc: Exception):
    """Return error details in response so curl/browser show the real cause (e.g. missing DB column)."""
    logger.exception("Unhandled exception: %s", exc)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal Server Error",
            "error": str(exc),
            "traceback": traceback.format_exc(),
        },
    )


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none';"
        return response


app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestIdMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(jobs.router)
app.include_router(admin.router)


@app.get("/")
def root():
    return {
        "message": "AI Upscaler API",
        "docs": "/docs",
        "health": "/health",
        "api_health": "/api/health",
        "jobs": "/api/jobs",
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/api/health")
def api_health(request: Request):
    """Deep health check: DB and Redis. Returns 503 if any dependency is down."""
    checks: dict[str, str] = {}
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        checks["database"] = "ok"
    except Exception as e:
        logger.warning("Health check DB failed: %s", e)
        checks["database"] = "error"
    try:
        r = redis.from_url(settings.redis_url)
        r.ping()
        checks["redis"] = "ok"
    except Exception as e:
        logger.warning("Health check Redis failed: %s", e)
        checks["redis"] = "error"
    if any(v == "error" for v in checks.values()):
        return JSONResponse(
            status_code=503,
            content={"status": "degraded", "checks": checks},
        )
    return {"status": "ok", "checks": checks}

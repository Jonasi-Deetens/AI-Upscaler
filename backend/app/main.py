import logging
import os
import traceback
from contextlib import asynccontextmanager

from alembic import command
from alembic.config import Config
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.api import jobs

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class RequestLogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        msg = f"Request: {request.method} {request.url.path}"
        logger.info(msg)
        print(msg, flush=True)
        response = await call_next(request)
        msg2 = f"Response: {request.method} {request.url.path} -> {response.status_code}"
        logger.info(msg2)
        print(msg2, flush=True)
        return response


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


app.add_middleware(RequestLogMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(jobs.router)


@app.get("/")
def root():
    return {
        "message": "AI Upscaler API",
        "docs": "/docs",
        "health": "/health",
        "jobs": "/api/jobs",
    }


@app.get("/health")
def health():
    return {"status": "ok"}

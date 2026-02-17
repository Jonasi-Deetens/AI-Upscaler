#!/bin/sh
set -e
# Run from /app so scripts and celery app resolve (survives bind mount of worker source in dev).
cd /app
# Download weights in background so Celery starts immediately and picks up the queue.
# Worker code also downloads missing weights on first use, so jobs can run while this finishes.
python scripts/download_weights.py &
exec celery -A app.celery_app worker -B --loglevel=info --concurrency=1 "$@"

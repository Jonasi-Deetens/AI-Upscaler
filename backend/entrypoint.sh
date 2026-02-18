#!/bin/sh
set -e
# Ensure storage dir exists and is writable by app user (uid 1000)
STORAGE="${LOCAL_STORAGE_PATH:-/app/storage}"
mkdir -p "$STORAGE/originals" "$STORAGE/results"
chown -R 1000:1000 "$STORAGE" 2>/dev/null || true
exec gosu appuser "$@"

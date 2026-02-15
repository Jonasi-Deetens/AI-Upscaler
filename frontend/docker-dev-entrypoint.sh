#!/bin/sh
set -e
# When source is mounted over /app, node_modules live in a volume. Install or update deps when needed.
NEED_CI=false
if [ ! -d node_modules/next ]; then
  NEED_CI=true
elif [ -f package-lock.json ] && [ -f node_modules/.ci-done ] && [ package-lock.json -nt node_modules/.ci-done ]; then
  NEED_CI=true
fi
if [ "$NEED_CI" = true ]; then
  echo "Installing frontend dependencies..."
  npm ci
  touch node_modules/.ci-done
fi
exec "$@"

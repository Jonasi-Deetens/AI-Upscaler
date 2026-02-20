#!/bin/sh
set -e
# When source is mounted over /app, node_modules live in a volume. Install or update deps when lockfile changes.
NEED_CI=false
if [ ! -d node_modules/next ]; then
  NEED_CI=true
elif [ ! -d node_modules/react-markdown ]; then
  NEED_CI=true
elif [ ! -f node_modules/.ci-done ]; then
  NEED_CI=true
else
  # Re-run npm ci when package-lock.json content changes (e.g. new dependency added)
  NEW_HASH=$(node -e "require('crypto').createHash('sha256').update(require('fs').readFileSync('package-lock.json')).digest('hex')" 2>/dev/null || echo "unknown")
  OLD_HASH=$(cat node_modules/.ci-done 2>/dev/null || true)
  if [ -n "$NEW_HASH" ] && [ "$NEW_HASH" != "$OLD_HASH" ]; then
    NEED_CI=true
  fi
fi
if [ "$NEED_CI" = true ]; then
  echo "Installing frontend dependencies..."
  npm ci
  node -e "require('crypto').createHash('sha256').update(require('fs').readFileSync('package-lock.json')).digest('hex')" > node_modules/.ci-done 2>/dev/null || touch node_modules/.ci-done
fi
exec "$@"

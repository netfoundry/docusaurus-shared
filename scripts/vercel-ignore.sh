#!/usr/bin/env bash
# Vercel "Ignored Build Step" helper.
# Exit 0 = skip build, Exit 1 = build.
# Usage: scripts/vercel-ignore.sh <path>   e.g. scripts/vercel-ignore.sh packages/

set -e

WATCH_PATH="$1"

if [ -z "$WATCH_PATH" ]; then
  echo "usage: $0 <path>" >&2
  exit 1
fi

# Vercel clones shallow with no 'origin' remote configured. Wire one up.
if ! git remote get-url origin >/dev/null 2>&1; then
  git remote add origin "https://github.com/netfoundry/docusaurus-shared"
fi

git fetch origin main --depth=100

if git diff --quiet origin/main...HEAD -- "$WATCH_PATH"; then
  echo "No changes under $WATCH_PATH vs origin/main -- skipping build."
  exit 0
else
  echo "Changes detected under $WATCH_PATH vs origin/main -- building."
  exit 1
fi


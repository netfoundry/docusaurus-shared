#!/bin/bash
set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <remote_name>"
  exit 1
fi

REMOTE="$1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REMOTE_DIR="$SCRIPT_DIR/_remotes/$REMOTE/website"

echo "Syncing versioned docs from $REMOTE_DIR..."

rm -rf "$SCRIPT_DIR/${REMOTE}_versioned_docs" \
       "$SCRIPT_DIR/${REMOTE}_versioned_sidebars" \
       "$SCRIPT_DIR/${REMOTE}_versions.json"

cp -r "$REMOTE_DIR/${REMOTE}_versioned_docs" "$SCRIPT_DIR/${REMOTE}_versioned_docs"
cp -r "$REMOTE_DIR/${REMOTE}_versioned_sidebars" "$SCRIPT_DIR/${REMOTE}_versioned_sidebars"
cp "$REMOTE_DIR/${REMOTE}_versions.json" "$SCRIPT_DIR/${REMOTE}_versions.json"

chmod 755 "$SCRIPT_DIR/${REMOTE}_versioned_sidebars"

echo "✓ Copied ${REMOTE}_versioned_docs/"
echo "✓ Copied ${REMOTE}_versioned_sidebars/"
echo "✓ Copied ${REMOTE}_versions.json"

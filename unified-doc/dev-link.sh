#!/usr/bin/env bash
# Links the local docusaurus-theme into unified-doc for development.
# Run once to set up, then use `yarn watch` in packages/docusaurus-theme
# and `yarn start` in unified-doc as normal.
#
# Usage:
#   ./dev-link.sh          # link
#   ./dev-link.sh unlink   # restore npm version

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
THEME_DIR="$SCRIPT_DIR/../packages/docusaurus-theme"
UNIFIED_DIR="$SCRIPT_DIR"

if [ ! -d "$UNIFIED_DIR" ]; then
  echo "ERROR: unified-doc not found at $UNIFIED_DIR"
  exit 1
fi

if [ "${1}" = "unlink" ]; then
  echo "→ Unlinking @netfoundry/docusaurus-theme from unified-doc..."
  cd "$UNIFIED_DIR" && yarn unlink @netfoundry/docusaurus-theme && yarn install --force
  echo "✓ Restored npm version"
else
  echo "→ Registering theme package for linking..."
  cd "$THEME_DIR" && yarn link

  echo "→ Linking into unified-doc..."
  cd "$UNIFIED_DIR" && yarn link @netfoundry/docusaurus-theme

  echo ""
  echo "✓ Done. Now run in two terminals:"
  echo "  [1] cd packages/docusaurus-theme && yarn watch"
  echo "  [2] cd $UNIFIED_DIR && yarn start"
fi

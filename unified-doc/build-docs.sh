#!/usr/bin/env bash
# =============================================================================
# build-docs.sh — thin platform shim.
#
# All build logic lives in build-docs.mjs, the single cross-platform source of
# truth (shared with build-docs.ps1). This script only forwards its arguments so
# existing callers (CI, publish-unified-doc.sh, visual-diff.sh) keep working.
#
# Run `node build-docs.mjs --help` for the full option/env-var reference.
# =============================================================================
set -euo pipefail
script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
exec node "${script_dir}/build-docs.mjs" "$@"

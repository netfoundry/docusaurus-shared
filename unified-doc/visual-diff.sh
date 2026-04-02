#!/usr/bin/env bash
# =============================================================================
# visual-diff.sh — Visual regression diff: local build vs. production
#
# Builds the docs (optional), starts the local server, captures screenshots
# of both the local build and production (https://netfoundry.io/docs), then
# diffs them with BackstopJS and opens the HTML report.
#
# USAGE
#   ./visual-diff.sh [OPTIONS]
#
# OPTIONS
#   --skip-build          Skip running build-docs.sh (use an existing build)
#   --product=PRODUCT     Only run for one product: home, openziti, frontdoor,
#                         selfhosted, zrok, zlan  (default: all)
#   --port=PORT           Port that 'yarn serve' binds to  (default: 3000)
#   --no-report           Do not open the HTML report after the run
#   --reference-only      Only capture reference (production) screenshots; skip test/diff
#   --test-only           Skip reference capture; only run local test + diff
#                         (requires reference screenshots to already exist)
#   -h, --help            Show this help and exit
#
# EXAMPLES
#   ./visual-diff.sh
#   ./visual-diff.sh --skip-build
#   ./visual-diff.sh --skip-build --product=zlan
#   ./visual-diff.sh --skip-build --test-only --product=openziti
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

# ---------------------------------------------------------------------------
# Defaults
# ---------------------------------------------------------------------------
SKIP_BUILD=0
PRODUCT="all"
PORT=3000
NO_REPORT=0
REFERENCE_ONLY=0
TEST_ONLY=0

PRODUCTS_ALL=(home openziti frontdoor selfhosted zrok zlan)

# ---------------------------------------------------------------------------
# Argument parsing
# ---------------------------------------------------------------------------
usage() {
  sed -n '/^# USAGE/,/^# =====/{ /^# =====/d; s/^# \{0,1\}//; p }' "$0"
}

while [[ $# -gt 0 ]]; do
  case $1 in
    --skip-build)       SKIP_BUILD=1;                   shift ;;
    --product=*)        PRODUCT="${1#*=}";               shift ;;
    --port=*)           PORT="${1#*=}";                  shift ;;
    --no-report)        NO_REPORT=1;                     shift ;;
    --reference-only)   REFERENCE_ONLY=1;                shift ;;
    --test-only)        TEST_ONLY=1;                     shift ;;
    -h|--help)          usage; exit 0 ;;
    *)  echo "Unknown option: $1" >&2; usage; exit 1 ;;
  esac
done

if [[ "$REFERENCE_ONLY" -eq 1 && "$TEST_ONLY" -eq 1 ]]; then
  echo "Error: --reference-only and --test-only are mutually exclusive." >&2
  exit 1
fi

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
log()  { echo "[vdiff] $*"; }
ok()   { echo "[vdiff] OK  $*"; }
fail() { echo "[vdiff] ERR $*" >&2; exit 1; }

wait_for_server() {
  local url="http://localhost:${PORT}/docs"
  local max_wait=120   # seconds
  local interval=3
  local elapsed=0
  log "Waiting for server at ${url} ..."
  while ! curl -sf --max-time 5 "$url" >/dev/null 2>&1; do
    if [[ "$elapsed" -ge "$max_wait" ]]; then
      fail "Server did not respond after ${max_wait}s. Check 'yarn serve' output."
    fi
    sleep "$interval"
    elapsed=$(( elapsed + interval ))
    log "  ...still waiting (${elapsed}s / ${max_wait}s)"
  done
  ok "Server is up at ${url}"
}

open_report() {
  local path="$1"
  if [[ "$NO_REPORT" -eq 1 ]]; then return; fi
  log "Opening report: $path"
  if command -v xdg-open &>/dev/null; then
    xdg-open "$path" &
  elif command -v open &>/dev/null; then
    open "$path" &
  else
    log "Cannot auto-open browser. Report is at: $path"
  fi
}

products_to_run() {
  if [[ "$PRODUCT" == "all" ]]; then
    echo "${PRODUCTS_ALL[@]}"
  else
    # Validate
    local valid=0
    for p in "${PRODUCTS_ALL[@]}"; do
      [[ "$p" == "$PRODUCT" ]] && valid=1 && break
    done
    if [[ "$valid" -eq 0 ]]; then
      fail "Unknown product '${PRODUCT}'. Valid: ${PRODUCTS_ALL[*]}"
    fi
    echo "$PRODUCT"
  fi
}

SERVE_PID=""
cleanup() {
  if [[ -n "$SERVE_PID" ]]; then
    log "Stopping local server (pid $SERVE_PID)..."
    kill "$SERVE_PID" 2>/dev/null || true
    wait "$SERVE_PID" 2>/dev/null || true
    SERVE_PID=""
  fi
}
trap cleanup EXIT INT TERM

# ---------------------------------------------------------------------------
# Step 1 — Build
# ---------------------------------------------------------------------------
if [[ "$SKIP_BUILD" -eq 0 ]]; then
  log "=== Step 1/5: Building docs ==="
  "${SCRIPT_DIR}/build-docs.sh" -l -g -c
  ok "Build complete."
else
  log "=== Step 1/5: Skipping build (--skip-build) ==="
fi

# ---------------------------------------------------------------------------
# Step 2 — Start local server (only needed for test phase)
# ---------------------------------------------------------------------------
if [[ "$REFERENCE_ONLY" -eq 0 ]]; then
  log "=== Step 2/5: Starting local server (yarn serve --port ${PORT}) ==="
  pushd "${SCRIPT_DIR}" >/dev/null
  yarn serve --port "$PORT" >/tmp/visual-diff-serve.log 2>&1 &
  SERVE_PID=$!
  popd >/dev/null
  log "yarn serve started (pid $SERVE_PID). Log: /tmp/visual-diff-serve.log"
  wait_for_server
else
  log "=== Step 2/5: Skipping server (--reference-only) ==="
fi

# ---------------------------------------------------------------------------
# Step 3 — Generate BackstopJS scenarios from production sitemap
# ---------------------------------------------------------------------------
log "=== Step 3/5: Generating BackstopJS scenarios from sitemap ==="
pushd "${SCRIPT_DIR}" >/dev/null
node scripts/generate-vrt-scenarios.mjs "$PRODUCT"
ok "Scenarios generated."
popd >/dev/null

# ---------------------------------------------------------------------------
# Step 4 — Capture screenshots
# ---------------------------------------------------------------------------
read -ra PRODUCTS_LIST <<< "$(products_to_run)"

pushd "${SCRIPT_DIR}" >/dev/null

if [[ "$TEST_ONLY" -eq 0 ]]; then
  log "=== Step 4a/5: Capturing PRODUCTION screenshots (reference) ==="
  for prod in "${PRODUCTS_LIST[@]}"; do
    config="backstop.${prod}.json"
    if [[ ! -f "$config" ]]; then
      log "  SKIP $prod — no config file $config"
      continue
    fi
    log "  reference: $prod"
    npx backstop reference --config="$config" || true
  done
  ok "Production screenshots captured."
else
  log "=== Step 4a/5: Skipping reference capture (--test-only) ==="
fi

if [[ "$REFERENCE_ONLY" -eq 0 ]]; then
  log "=== Step 4b/5: Capturing LOCAL screenshots (test) ==="
  for prod in "${PRODUCTS_LIST[@]}"; do
    config="backstop.${prod}.json"
    if [[ ! -f "$config" ]]; then
      log "  SKIP $prod — no config file $config"
      continue
    fi
    log "  test: $prod"
    npx backstop test --config="$config" || true   # || true: don't abort on mismatch
  done
  ok "Local screenshots captured."
else
  log "=== Step 4b/5: Skipping local capture (--reference-only) ==="
fi

# ---------------------------------------------------------------------------
# Step 5 — Open reports
# ---------------------------------------------------------------------------
if [[ "$REFERENCE_ONLY" -eq 0 ]]; then
  log "=== Step 5/5: Opening diff reports ==="
  for prod in "${PRODUCTS_LIST[@]}"; do
    report="backstop_data/html_report_${prod}/index.html"
    if [[ -f "$report" ]]; then
      open_report "${SCRIPT_DIR}/${report}"
    else
      log "  No report yet for $prod (${report})"
    fi
  done
else
  log "=== Step 5/5: Skipping reports (--reference-only) ==="
fi

popd >/dev/null

log "Done."

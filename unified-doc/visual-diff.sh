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
#   --force-reference     Always re-capture production screenshots without prompting
#   --url-filter=FILTER   Comma-separated URL path substrings to restrict pages
#                         e.g. --url-filter=openziti,frontdoor
#   --desktop-only        Only capture desktop viewport (skip tablet/mobile)
#   -h, --help            Show this help and exit
#
# EXAMPLES
#   ./visual-diff.sh
#   ./visual-diff.sh --skip-build
#   ./visual-diff.sh --skip-build --product=zlan
#   ./visual-diff.sh --skip-build --test-only --product=openziti
#   ./visual-diff.sh --skip-build --force-reference
#   ./visual-diff.sh --skip-build --url-filter=frontdoor --desktop-only
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
FORCE_REFERENCE=0
URL_FILTER=""
DESKTOP_ONLY=0

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
    --force-reference)  FORCE_REFERENCE=1;               shift ;;
    --url-filter=*)     URL_FILTER="${1#*=}";             shift ;;
    --desktop-only)     DESKTOP_ONLY=1;                  shift ;;
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
  local max_wait=120
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

ref_bitmaps_exist() {
  local prod="$1"
  local ref_dir="${SCRIPT_DIR}/backstop_data/bitmaps_reference_${prod}"
  [[ -d "$ref_dir" ]] && [[ -n "$(find "$ref_dir" -type f 2>/dev/null | head -1)" ]]
}

stop_server() {
  log "Stopping local server on port ${PORT}..."
  local server_pid
  server_pid=$(lsof -ti "tcp:${PORT}" 2>/dev/null || true)
  if [[ -n "$server_pid" ]]; then
    log "  killing pid $server_pid (listening on port ${PORT})"
    kill "$server_pid" 2>/dev/null || true
  else
    log "  no process found listening on port ${PORT}"
  fi
}

# ---------------------------------------------------------------------------
# Preflight — Playwright Chromium
# ---------------------------------------------------------------------------
log "=== Preflight: Checking Playwright Chromium ==="
chromium_exe=$(find "${HOME}/.cache/ms-playwright" -name "chrome" -o -name "chromium" 2>/dev/null | head -1 || true)
if [[ -z "$chromium_exe" ]]; then
  log "Playwright Chromium not found. Installing now..."
  pushd "${SCRIPT_DIR}" >/dev/null
  npx playwright install chromium
  if [[ $? -ne 0 ]]; then fail "Failed to install Playwright Chromium. Run: npx playwright install chromium"; fi
  popd >/dev/null
  ok "Playwright Chromium installed."
else
  ok "Playwright Chromium found at ${chromium_exe}"
fi

# ---------------------------------------------------------------------------
# Step 1 — Build
# ---------------------------------------------------------------------------
build_dir="${SCRIPT_DIR}/build"
build_exists=0
if [[ -d "$build_dir" ]] && [[ -n "$(find "$build_dir" -type f 2>/dev/null | head -1)" ]]; then
  build_exists=1
fi

if [[ "$SKIP_BUILD" -eq 1 ]]; then
  log "=== Step 1/5: Skipping build (--skip-build) ==="
elif [[ "$build_exists" -eq 1 ]]; then
  echo ""
  echo "  An existing build was found at: $build_dir"
  echo ""
  read -rp "  Rebuild docs? [y/N] " answer
  if [[ "$answer" =~ ^[Yy] ]]; then
    log "=== Step 1/5: Building docs ==="
    "${SCRIPT_DIR}/build-docs.sh" -l || log "  Build failed — using existing build and continuing."
    ok "Build complete."
  else
    log "=== Step 1/5: Using existing build (skipped rebuild) ==="
  fi
else
  log "=== Step 1/5: No build found — building docs ==="
  "${SCRIPT_DIR}/build-docs.sh" -l
  ok "Build complete."
fi

# ---------------------------------------------------------------------------
# Step 2 — Start local server
# ---------------------------------------------------------------------------
trap stop_server EXIT INT TERM

if [[ "$REFERENCE_ONLY" -eq 0 ]]; then
  log "=== Step 2/5: Starting local server (yarn serve --port ${PORT}) ==="
  pushd "${SCRIPT_DIR}" >/dev/null
  yarn serve --port "$PORT" >/tmp/visual-diff-serve.log 2>&1 &
  popd >/dev/null
  log "yarn serve started. Log: /tmp/visual-diff-serve.log"
  wait_for_server
else
  log "=== Step 2/5: Skipping server (--reference-only) ==="
fi

# ---------------------------------------------------------------------------
# Step 3 — Generate BackstopJS scenarios from production sitemap
# ---------------------------------------------------------------------------
log "=== Step 3/5: Generating BackstopJS scenarios from sitemap ==="
pushd "${SCRIPT_DIR}" >/dev/null
generate_args=("scripts/generate-vrt-scenarios.mjs" "$PRODUCT")
if [[ -n "$URL_FILTER" ]]; then
  generate_args+=("--filter=${URL_FILTER}")
  log "  URL filter: ${URL_FILTER}"
fi
if [[ "$DESKTOP_ONLY" -eq 1 ]]; then
  generate_args+=("--desktop-only")
  log "  Desktop only (skipping tablet/mobile)"
fi
step3_time=$(date +%s)
node "${generate_args[@]}"
if [[ $? -ne 0 ]]; then fail "generate-vrt-scenarios.mjs failed"; fi
ok "Scenarios generated."
popd >/dev/null

# Derive active product list from configs written after step3_time
PRODUCTS_LIST=()
for prod in "${PRODUCTS_ALL[@]}"; do
  cfg="${SCRIPT_DIR}/backstop.${prod}.json"
  if [[ -f "$cfg" ]]; then
    cfg_time=$(date -r "$cfg" +%s 2>/dev/null || stat -c %Y "$cfg" 2>/dev/null || echo 0)
    if [[ "$cfg_time" -gt "$step3_time" ]]; then
      PRODUCTS_LIST+=("$prod")
    fi
  fi
done

if [[ "${#PRODUCTS_LIST[@]}" -eq 0 ]]; then
  fail "No backstop configs were generated. Check sitemap and filter."
fi
log "  Active products: ${PRODUCTS_LIST[*]}"

# ---------------------------------------------------------------------------
# Step 4 — Capture screenshots (parallel per product)
# ---------------------------------------------------------------------------
pushd "${SCRIPT_DIR}" >/dev/null

backstop_parallel() {
  local action="$1"
  shift
  local products=("$@")
  local pids=()
  local logs=()
  local prods_running=()
  local backstop_bin="${SCRIPT_DIR}/node_modules/.bin/backstop"

  for prod in "${products[@]}"; do
    local config="backstop.${prod}.json"
    if [[ ! -f "$config" ]]; then
      log "  SKIP $prod — no config file $config"
      continue
    fi
    local logfile="/tmp/vdiff-${action}-${prod}.log"
    log "  queuing ${action} : ${prod}"
    "$backstop_bin" "$action" "--config=${config}" >"$logfile" 2>&1 &
    pids+=($!)
    logs+=("$logfile")
    prods_running+=("$prod")
  done

  if [[ "${#pids[@]}" -eq 0 ]]; then return; fi

  log "  running ${#pids[@]} ${action} job(s) in parallel..."

  # Track read position per product for streaming output
  declare -A log_pos
  for prod in "${prods_running[@]}"; do
    log_pos["$prod"]=0
  done

  local all_done=0
  while [[ "$all_done" -eq 0 ]]; do
    sleep 2
    all_done=1
    for i in "${!pids[@]}"; do
      local p="${pids[$i]}"
      local prod="${prods_running[$i]}"
      local logfile="${logs[$i]}"
      if kill -0 "$p" 2>/dev/null; then
        all_done=0
        # Stream new lines since last read
        if [[ -f "$logfile" ]]; then
          local pos="${log_pos[$prod]}"
          local new_lines
          new_lines=$(tail -n +"$((pos + 1))" "$logfile" 2>/dev/null | \
            grep -v 'BackstopTools have been installed\|x Close Browser\|Browser Console Log' || true)
          if [[ -n "$new_lines" ]]; then
            local total_lines
            total_lines=$(wc -l < "$logfile")
            log_pos["$prod"]="$total_lines"
            local done_count=$(( ${#pids[@]} - $(jobs -r | wc -l) ))
            while IFS= read -r line; do
              [[ -n "$line" ]] && log "  [${prod}] (${done_count}/${#pids[@]} done) ${line}"
            done <<< "$new_lines"
          fi
        fi
      fi
    done
  done

  # Wait for all and report results
  for i in "${!pids[@]}"; do
    local p="${pids[$i]}"
    local prod="${prods_running[$i]}"
    local logfile="${logs[$i]}"
    wait "$p" && ec=0 || ec=$?
    local icon="OK "
    [[ "$ec" -ne 0 ]] && icon="FAIL"
    log "  [${icon}] ${prod} (exit ${ec})"
    # Print any remaining output
    if [[ -f "$logfile" ]]; then
      local pos="${log_pos[$prod]}"
      tail -n +"$((pos + 1))" "$logfile" 2>/dev/null | \
        grep -v 'BackstopTools have been installed\|x Close Browser\|Browser Console Log' | \
        while IFS= read -r line; do
          [[ -n "$line" ]] && echo "      $line"
        done || true
    fi
  done
}

# Step 4a — Reference
run_reference=0
if [[ "$TEST_ONLY" -eq 1 ]]; then
  log "=== Step 4a/5: Skipping reference capture (--test-only) ==="
elif [[ "$FORCE_REFERENCE" -eq 1 ]]; then
  log "=== Step 4a/5: Capturing PRODUCTION screenshots (--force-reference) ==="
  run_reference=1
else
  missing_ref=()
  for prod in "${PRODUCTS_LIST[@]}"; do
    ref_bitmaps_exist "$prod" || missing_ref+=("$prod")
  done

  if [[ "${#missing_ref[@]}" -gt 0 ]]; then
    echo ""
    echo "  No production reference screenshots found for: ${missing_ref[*]}"
    echo "  These are needed to diff against your local build."
    echo ""
    read -rp "  Capture production screenshots now? [Y/n] " answer
    if [[ -z "$answer" || "$answer" =~ ^[Yy] ]]; then
      log "=== Step 4a/5: Capturing PRODUCTION screenshots (reference) ==="
      run_reference=1
    else
      log "=== Step 4a/5: Skipping reference capture (user declined) ==="
    fi
  else
    log "=== Step 4a/5: Reference screenshots exist — skipping (use --force-reference to refresh) ==="
  fi
fi

if [[ "$run_reference" -eq 1 ]]; then
  backstop_parallel "reference" "${PRODUCTS_LIST[@]}"
  ok "Production screenshots captured."
fi

# Step 4b — Test
if [[ "$REFERENCE_ONLY" -eq 0 ]]; then
  log "=== Step 4b/5: Capturing LOCAL screenshots (test) ==="
  backstop_parallel "test" "${PRODUCTS_LIST[@]}"
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
    report="${SCRIPT_DIR}/backstop_data/html_report_${prod}/index.html"
    if [[ -f "$report" ]]; then
      open_report "$report"
    else
      log "  No report yet for ${prod} (${report})"
    fi
  done
else
  log "=== Step 5/5: Skipping reports (--reference-only) ==="
fi

popd >/dev/null
log "Done."

#!/usr/bin/env bash
# Build the drift-alert context for the Mattermost notification step.
#
# Usage: build-drift-alert-context.sh <repo> <run-id> <github-output> [report]
#
#   repo            GitHub repository slug (e.g. netfoundry/docusaurus-shared)
#   run-id          GitHub Actions run ID (or any string when testing locally)
#   github-output   Path to write key=value outputs (/dev/stdout works for local testing)
#   report          Path to sitemap-drift.json
#                   (default: unified-doc/build-site/sitemap-drift.json)

set -euo pipefail

REPO="${1:?Usage: $0 <repo> <run-id> <github-output> [report]}"
RUN_ID="${2:?missing run-id}"
OUTPUT_FILE="${3:?missing github-output path}"
REPORT="${4:-unified-doc/build-site/sitemap-drift.json}"

if [ ! -f "$REPORT" ]; then
  echo "has_drift=false" >> "$OUTPUT_FILE"
  exit 0
fi

echo "has_drift=true" >> "$OUTPUT_FILE"

COUNT=$(jq '.count' "$REPORT")
PATHS=$(jq -r '.unresolved[]' "$REPORT" | head -20 | sed 's/^/- /')
RUN_URL="https://github.com/${REPO}/actions/runs/${RUN_ID}"

BODY=$(printf '❌ **%s path(s) removed with no redirect** — build blocked before publish.\n\n%s\n\n[View build logs](%s)' \
  "${COUNT}" "${PATHS}" "${RUN_URL}")

EVENT_JSON=$(jq -cn \
  --arg repo     "$REPO" \
  --arg repo_url "https://github.com/$REPO" \
  --arg run_url  "$RUN_URL" \
  --arg action   "$BODY" \
  '{
    repository: { full_name: $repo, html_url: $repo_url, stargazers_count: 0 },
    sender: {
      login: "ziti-ci",
      url: "https://api.github.com/users/netfoundry",
      html_url: "https://github.com/netfoundry",
      avatar_url: "https://raw.githubusercontent.com/netfoundry/branding/refs/heads/main/images/png/icon/netfoundry-icon-color.png"
    },
    action: $action,
    schedule: "0 2 * * *",
    run_url: $run_url
  }')

echo "event-json=$EVENT_JSON" >> "$OUTPUT_FILE"

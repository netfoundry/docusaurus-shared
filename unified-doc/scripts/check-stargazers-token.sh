#!/bin/bash

# Verifies the stargazers read token still works and warns before it expires.
#
# The netfoundry.io stars chart is built by gh-stats.sh (openziti/ziti-doc), which reads
# GitHub's "List stargazers" API. That endpoint was restricted on 2026-06-30 to a
# collaborator-scoped token (STARGAZERS_READ_TOKEN, metadata:read across the openziti org).
# If that token is revoked, rescoped, or expires, the chart silently freezes. This check
# fails loudly instead so the weekly workflow can alert doc-alerts.
#
# Fails (exit 1) when:
#   - no token is provided
#   - the live stargazers request does not return HTTP 200 (expired / revoked / rescoped)
#   - the token's expiration is within WARN_DAYS (default 14)
#
# Fine-grained and expiring PATs report their expiry in the
# 'github-authentication-token-expiration' response header; non-expiring credentials omit
# it, in which case only the reachability check applies.
#
# Usage: STARGAZERS_READ_TOKEN=xxx ./check-stargazers-token.sh [warn_days]

set -euo pipefail

TOKEN="${STARGAZERS_READ_TOKEN:-}"
WARN_DAYS="${1:-${WARN_DAYS:-14}}"
PROBE_URL="https://api.github.com/repos/openziti/ziti/stargazers?per_page=1"

if [[ -z "$TOKEN" ]]; then
  echo "❌ STARGAZERS_READ_TOKEN is not set"
  exit 1
fi

headers="$(mktemp)"
trap 'rm -f "$headers"' EXIT

status="$(curl -sS -o /dev/null -D "$headers" -w '%{http_code}' \
  -H "Accept: application/vnd.github.star+json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "$PROBE_URL")"

if [[ "$status" != "200" ]]; then
  echo "❌ stargazers probe returned HTTP ${status}"
  echo "   token is expired, revoked, or missing metadata:read on the openziti org"
  exit 1
fi
echo "✅ stargazers API reachable with the token (HTTP 200)"

exp="$(grep -i '^github-authentication-token-expiration:' "$headers" \
  | sed -E 's/^[^:]+:[[:space:]]*//' | tr -d '\r' || true)"

if [[ -z "$exp" ]]; then
  echo "⚠️  no expiration header returned -- token may be non-expiring; skipping expiry check"
  exit 0
fi

exp_epoch="$(date -d "$exp" +%s 2>/dev/null || true)"
if [[ -z "$exp_epoch" ]]; then
  echo "⚠️  could not parse expiration '${exp}'; skipping expiry check"
  exit 0
fi

now_epoch="$(date +%s)"
days_left=$(( (exp_epoch - now_epoch) / 86400 ))
echo "token expires ${exp} (${days_left} day(s) left)"

if (( days_left <= WARN_DAYS )); then
  echo "❌ token expires in ${days_left} day(s) (<= ${WARN_DAYS}); rotate STARGAZERS_READ_TOKEN"
  exit 1
fi
echo "✅ token healthy (${days_left} day(s) > ${WARN_DAYS}-day warning threshold)"

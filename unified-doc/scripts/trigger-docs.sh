#!/usr/bin/env bash
set -u  # no -e

errors=0

# ==== REQUIRED ENV VARS ====
check_var() {
  local name="$1" msg="$2"
  if [[ -z "${!name:-}" ]]; then
    echo "❌ $msg" >&2
    errors=$((errors+1))
  fi
}

check_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "❌ $cmd not installed" >&2
    errors=$((errors+1))
  fi
}

check_var GH_APP_ID "must set GH_APP_ID"
check_var GH_REPO_OWNER "must set GH_REPO_OWNER"
check_var GH_REPO_NAME "must set GH_REPO_NAME"
check_var GH_WORKFLOW "must set GH_WORKFLOW (e.g. publish.yml)"
GH_REF="main" #always target main

if [[ -z "${GH_APP_KEY_FILE:-}" && -z "${GH_APP_KEY:-}" ]]; then
  echo "❌ must set either GH_APP_KEY_FILE or GH_APP_KEY" >&2
  errors=$((errors+1))
fi

check_cmd jq
check_cmd openssl
check_cmd curl

if (( errors > 0 )); then
  echo "------------------------------------------------"
  echo "-- Found $errors configuration errors. Aborting.    --" >&2
  echo "------------------------------------------------"
  exit 1
fi

# ==== BUILD JWT ====
now=$(date +%s)
iat=$((now - 60))
exp=$((now + 300))

header='{"alg":"RS256","typ":"JWT"}'
payload=$(jq -nc --arg iat "$iat" --arg exp "$exp" --arg iss "$GH_APP_ID" \
  '{iat: ($iat|tonumber), exp: ($exp|tonumber), iss: $iss}')

b64url() { openssl base64 -A | tr '+/' '-_' | tr -d '='; }

jwt="$(printf '%s' "$header" | b64url).$(printf '%s' "$payload" | b64url)"

if [[ -n "${GH_APP_KEY_FILE:-}" ]]; then
  sig=$(printf '%s' "$jwt" | \
    openssl dgst -binary -sha256 -sign "$GH_APP_KEY_FILE" | b64url) || true
else
  sig=$(printf '%s' "$jwt" | \
    openssl dgst -binary -sha256 -sign <(printf '%s' "$GH_APP_KEY") | b64url) || true
fi

jwt="$jwt.$sig"

# ==== GET INSTALLATION ID ====
resp=$(curl -s -H "Authorization: Bearer $jwt" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/app/installations)

install_id=$(echo "$resp" | jq -r '.[0].id' 2>/dev/null || echo "")
if [[ -z "$install_id" || "$install_id" == "null" ]]; then
  echo "❌ failed to get installations: $resp" >&2
  errors=$((errors+1))
fi

# ==== GET INSTALLATION TOKEN ====
if (( errors == 0 )); then
  resp=$(curl -s -X POST \
    -H "Authorization: Bearer $jwt" \
    -H "Accept: application/vnd.github+json" \
    https://api.github.com/app/installations/$install_id/access_tokens)

  gh_token=$(echo "$resp" | jq -r .token 2>/dev/null || echo "")
  if [[ -z "$gh_token" || "$gh_token" == "null" ]]; then
    echo "❌ failed to get token: $resp" >&2
    errors=$((errors+1))
  fi
fi

# ==== DISPATCH WORKFLOW ====
if (( errors == 0 )); then
  inputs_json=${GH_INPUTS:-'{}'}
  dispatch=$(curl -s -X POST \
    -H "Authorization: Bearer $gh_token" \
    -H "Accept: application/vnd.github+json" \
    "https://api.github.com/repos/$GH_REPO_OWNER/$GH_REPO_NAME/actions/workflows/$GH_WORKFLOW/dispatches" \
    -d "{\"ref\":\"$GH_REF\",\"inputs\":$inputs_json}")

  if [[ -n "$dispatch" ]]; then
    echo "❌ dispatch failed: $dispatch" >&2
    errors=$((errors+1))
  else
    echo "✅ Workflow $GH_WORKFLOW dispatched on ${GH_REF:-main}"
  fi
fi

if (( errors > 0 )); then
  echo "❌ Completed with $errors error(s)." >&2
  exit 1
fi

---
sidebar_label: "Bash"
---

# Theme test: Bash

```bash
#!/usr/bin/env bash
# provision a quickstart overlay and a first service
set -euo pipefail

CTRL_ADDR="${CTRL_ADDR:-quickstart.demo.openziti.io}"
PORT=1280
RETRIES=5

log() {
  local level="$1"; shift
  printf '[%s] %s\n' "${level^^}" "$*" >&2
}

wait_for_controller() {
  local url="https://${CTRL_ADDR}:${PORT}/edge/client/v1/version"
  for ((i = 1; i <= RETRIES; i++)); do
    if curl -sk -o /dev/null -w '%{http_code}' "$url" | grep -q '^200$'; then
      log info "controller ready after ${i} attempt(s)"
      return 0
    fi
    sleep 2
  done
  log error "controller never came up"
  return 1
}

main() {
  ziti run quickstart --zac --ctrl-address "$CTRL_ADDR" &
  local pid=$!
  trap 'kill "$pid" 2>/dev/null || true' EXIT

  wait_for_controller || exit 1

  ziti login "localhost:${PORT}" --username admin --password "${ZITI_PWD:-admin}"
  local routers
  routers=$(ziti list edge-routers 'name contains "quickstart"' --output-json | jq '.data | length')
  log info "found ${routers} matching router(s)"
}

main "$@"
```

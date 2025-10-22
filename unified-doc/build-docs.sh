#!/usr/bin/env bash
set -euo pipefail

# args: optional --clean flag + optional build qualifier like "-prod"
CLEAN=0
BUILD_QUALIFIER=""
QUALIFIER_FLAG=()
OTHER_FLAGS=()
EXTRA_ARGS=()

for arg in "$@"; do
  case $arg in
    --clean) CLEAN=1; OTHER_FLAGS+=("$arg") ;;
    --qualifier=*) BUILD_QUALIFIER="${arg#*=}"; QUALIFIER_FLAG=("$arg") ;;
    -*) OTHER_FLAGS+=("$arg") ;;   # only real flags go here, like -ds, -z
    *) EXTRA_ARGS+=("$arg") ;;
  esac
done

function _fix_helm_readme {
  local HELM_ROUTER_README="_remotes/openziti/docusaurus/docs/_remotes/helm-charts/charts/ziti-router/README.md"
  local HELM_ROUTER_README_EXAMPLES_URL="https://github.com/openziti/helm-charts/tree/main/charts/ziti-router/examples"
  [ -f "$HELM_ROUTER_README" ] && \
    sed -i -E "s@\]\(\.?/examples/?\)@](${HELM_ROUTER_README_EXAMPLES_URL})@g" "$HELM_ROUTER_README"
}

echo "bd CLEAN=$CLEAN"
echo "bd BUILD_QUALIFIER='$BUILD_QUALIFIER'"
echo "bd QUALIFIER_FLAG: ${QUALIFIER_FLAG[*]}"
echo "bd OTHER_FLAGS: ${OTHER_FLAGS[*]}"
echo "bd EXTRA_ARGS: ${EXTRA_ARGS[*]}"

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
clone_or_update() {
  local url="$1" dest="$2" branch="${3:-main}"
  local target="$script_dir/_remotes/$dest"

  case "$url" in
    *zlan*)
      if [ -n "${GH_ZITI_CI_REPO_ACCESS_PAT:-}" ]; then
        url="https://x-access-token:${GH_ZITI_CI_REPO_ACCESS_PAT}@github.com/netfoundry/zlan.git"
        echo "🔑 Using GH_ZITI_CI_REPO_ACCESS_PAT token for zlan" >&2
      else
        url="git@github.com:netfoundry/zlan.git"
        echo "🔑 Using SSH for zlan" >&2
      fi
      ;;
    *k8s-on-prem-installations*)
      if [ -n "${BB_REPO_TOKEN_ONPREM:-}" ]; then
        url="https://x-token-auth:${BB_REPO_TOKEN_ONPREM}@bitbucket.org/netfoundry/k8s-on-prem-installations.git"
        echo "🔑 Using BB_REPO_TOKEN_ONPREM token" >&2
      else
        url="git@bitbucket.org:netfoundry/k8s-on-prem-installations.git"
        echo "🔑 Using SSH for onprem" >&2
      fi
      ;;
    *zrok-connector*)
      if [ -n "${BB_REPO_TOKEN_FRONTDOOR:-}" ]; then
        url="https://x-token-auth:${BB_REPO_TOKEN_FRONTDOOR}@bitbucket.org/netfoundry/zrok-connector.git"
        echo "🔑 Using BB_REPO_TOKEN_FRONTDOOR token" >&2
      else
        url="git@bitbucket.org:netfoundry/zrok-connector.git"
        echo "🔑 Using SSH for frontdoor" >&2
      fi
      ;;
    *ziti-doc*)
      if [ -n "${GH_ZITI_CI_REPO_ACCESS_PAT:-}" ]; then
        url="https://x-access-token:${GH_ZITI_CI_REPO_ACCESS_PAT}@github.com/openziti/ziti-doc.git"
        echo "🔑 Using GH_ZITI_CI_REPO_ACCESS_PAT token for ziti-doc" >&2
      else
        url="git@github.com:openziti/ziti-doc.git"
        echo "🔑 Using SSH for ziti-doc" >&2
      fi
      ;;
  esac

  if [ -d "$target/.git" ]; then
    if [ "${CLEAN:-0}" -eq 1 ]; then
      if ! git -C "$target" fetch origin "$branch" --depth 1 \
           || ! git -C "$target" reset --hard "origin/$branch"; then
        echo "❌ Branch '$branch' not found in $url"
        echo "👉 Available branches:"
        git -C "$target" ls-remote --heads origin | awk '{print $2}' | sed 's|refs/heads/||'
        exit 1
      fi
    else
      echo "ℹ️  ${target} exists; skipping update (use --clean to reset)."
    fi
  else
    git clone --single-branch --branch "$branch" --depth 1 "$url" "$target" || {
      echo "❌ Branch '$branch' not found in $url"
      echo "👉 Available branches:"
      git ls-remote --heads "$url" | awk '{print $2}' | sed 's|refs/heads/||'
      exit 1
    }
  fi
}

clone_or_update "https://bitbucket.org/netfoundry/zrok-connector.git"            frontdoor develop
clone_or_update "https://bitbucket.org/netfoundry/k8s-on-prem-installations.git" onprem    main
clone_or_update "https://github.com/openziti/ziti-doc.git"                       openziti  updates-for-unified-doc-add-blogs
clone_or_update "https://github.com/netfoundry/zlan.git"                         zlan      main

export SDK_ROOT_TARGET="${script_dir}/static/openziti/reference/developer/sdk"
echo "creating openziti SDK target if necessary at: ${SDK_ROOT_TARGET}"
mkdir -p "${SDK_ROOT_TARGET}"


# before building apply and transmuations necessary...
_fix_helm_readme
"${script_dir}/_remotes/openziti/gendoc.sh" "${OTHER_FLAGS[@]}"

pushd "${script_dir}" >/dev/null
yarn install
now=$(date)
echo "$now" > "${script_dir}/static/build-time.txt"
echo "BUILDING docs into: build${BUILD_QUALIFIER} at $now"
yarn build --out-dir "build${BUILD_QUALIFIER}" 2>&1
popd >/dev/null

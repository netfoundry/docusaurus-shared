#!/usr/bin/env bash
set -euo pipefail

# args: optional --clean flag + optional build qualifier like "-prod"
CLEAN=0; BUILD_QUALIFIER=""
for a in "${@:-}"; do
  case "${a}" in
    --clean) CLEAN=1 ;;
    *) BUILD_QUALIFIER="${a}" ;;
  esac
done

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

setup_bitbucket_creds() {
  local url="$1"

  if [[ "$url" == *k8s-on-prem-installations* ]] && [ -n "${BB_REPO_TOKEN_ONPREM:-}" ]; then
    echo "🔑 Using ONPREM token for $url"
    git config --global credential.helper \
      "!echo username=x-token-auth; echo password=$BB_REPO_TOKEN_ONPREM"
  elif [[ "$url" == *zrok-connector* ]] && [ -n "${BB_REPO_TOKEN_FRONTDOOR:-}" ]; then
    echo "🔑 Using FRONTDOOR token for $url"
    git config --global credential.helper \
      "!echo username=x-token-auth; echo password=$BB_REPO_TOKEN_FRONTDOOR"
  else
    echo "🚫 No token configured for $url (credentials unset)"
    git config --global --unset credential.helper || true
  fi
}

clone_or_update() {
  local url="$1" dest="$2" branch="${3:-main}"
  local target="$script_dir/_remotes/$dest"

  setup_bitbucket_creds "$url"

  if [ -d "$target/.git" ]; then
    if [ "$CLEAN" -eq 1 ]; then
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


clone_or_update "git@bitbucket.org:netfoundry/zrok-connector.git"            frontdoor develop
clone_or_update "git@bitbucket.org:netfoundry/k8s-on-prem-installations.git" onprem    main
clone_or_update "git@github.com:openziti/ziti-doc.git"                       openziti  updates-for-unified-doc-add-blogs
clone_or_update "git@github.com:netfoundry/zlan"                             zlan      main

export SDK_ROOT_TARGET="${script_dir}/static/openziti/reference/developer/sdk"
echo "creating openziti SDK target if necessary at: ${SDK_ROOT_TARGET}"
mkdir -p "${SDK_ROOT_TARGET}"

"${script_dir}/_remotes/openziti/gendoc.sh" -ds

pushd "${script_dir}" >/dev/null
yarn install
now=$(date)
echo "$now" > "${script_dir}/static/build-time.txt"
echo "BUILDING docs into: build${BUILD_QUALIFIER} at $now"
yarn build --out-dir "build${BUILD_QUALIFIER}" 2>&1
popd >/dev/null

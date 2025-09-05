#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
BUILD_QUALIFIER="${1:-}"

clone_or_update() {
  local url="$1"
  local dest="$2"
  local branch="${3:-main}"
  local target="$script_dir/_remotes/$dest"

  if [ -d "$target/.git" ]; then
    git -C "$target" fetch origin "$branch" --depth 1
    git -C "$target" reset --hard "origin/$branch"
  else
    git clone --single-branch --branch "$branch" --depth 1 "$url" "$target"
  fi
}

clone_or_update "git@bitbucket.org:netfoundry/zrok-connector.git" frontdoor develop
clone_or_update "git@bitbucket.org:netfoundry/k8s-on-prem-installations.git" onprem unified-doc-changes
clone_or_update "git@github.com:openziti/ziti-doc.git" openziti updates-for-unified-doc
clone_or_update "git@github.com:netfoundry/zlan" zlan main

SKIP_DOCUSAURUS_GEN=yes "${script_dir}/_remotes/openziti/gendoc.sh"

pushd "${script_dir}"
yarn install
echo "$(date)" > static/build-time.txt
echo "BUILDING docs into: build${BUILD_QUALIFIER}"
yarn build --out-dir "build${BUILD_QUALIFIER}" 2>&1
popd





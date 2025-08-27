#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

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

# Example usage
clone_or_update "git@bitbucket.org:netfoundry/zrok-connector.git" frontdoor updates-for-unified-doc
clone_or_update "git@bitbucket.org:netfoundry/k8s-on-prem-installations.git" onprem unified-doc-changes
clone_or_update "git@github.com:openziti/ziti-doc.git" openziti updates-for-unified-doc

mkdir -p "${script_dir}/src/pages/docs/onprem/"
cp -f "${script_dir}/_remotes/onprem/docs-site/src/pages/OnPrem.module.css" "${script_dir}/src/pages/docs/onprem/"
cp -f "${script_dir}/_remotes/onprem/docs-site/src/pages/index.tsx" "${script_dir}/src/pages/docs/onprem/"

mkdir -p "${script_dir}/src/pages/docs/frontdoor/"
cp -f "${script_dir}/_remotes/frontdoor/docusaurus/src/pages/OnPrem.module.css" "${script_dir}/src/pages/docs/frontdoor/"
cp -f "${script_dir}/_remotes/frontdoor/docusaurus/src/pages/index.tsx" "${script_dir}/src/pages/docs/frontdoor/"

SKIP_DOCUSAURUS_GEN=yes "${script_dir}/_remotes/openziti/gendoc.sh"
#SKIP_DOCUSAURUS_GEN=no "${script_dir}/_remotes/openziti/gendoc.sh"
pushd "${script_dir}"
yarn install
echo "$(date)" > static/build-time.txt
yarn build
popd

#cp -r "${script_dir}/_remotes/openziti/docusaurus/static/img/"* "${script_dir}/static/img/"






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

clone_or_update() {
  local url="$1" dest="$2" branch="${3:-main}"
  local target="$script_dir/_remotes/$dest"

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

clone_or_update "git@bitbucket.org:netfoundry/zrok-connector.git"          frontdoor develop
clone_or_update "git@bitbucket.org:netfoundry/k8s-on-prem-installations.git" onprem    main
clone_or_update "git@github.com:openziti/ziti-doc.git"                      openziti  updates-for-unified-doc
clone_or_update "git@github.com:netfoundry/zlan"                            zlan      main

"${script_dir}/_remotes/openziti/gendoc.sh" -ds

# move the sdk doc to the 'proper' static location
OZ_SDK_DOC_SRC="${script_dir}/_remotes/openziti/docusaurus/static/docs"
OZ_SDK_DOC_DEST="${script_dir}/static/docs"
rm -rf "${script_dir}/static/docs"

echo "moving openziti sdk docs"
echo "  - from: $OZ_SDK_DOC_SRC"
echo "  -   to: $OZ_SDK_DOC_DEST"
mv "$OZ_SDK_DOC_SRC" "$OZ_SDK_DOC_DEST"

pushd "${script_dir}" >/dev/null
yarn install
date > static/build-time.txt
echo "BUILDING docs into: build${BUILD_QUALIFIER}"
yarn build --out-dir "build${BUILD_QUALIFIER}" 2>&1
popd >/dev/null

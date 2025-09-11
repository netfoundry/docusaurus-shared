#!/bin/bash

set -euo pipefail

: ${script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"}

flags="$@"

echo "build-docs.sh script located in: ${script_dir} with $flags and args: $@"

echo "ARGS: $@"
: ${SKIP_GIT:=no}
: ${SKIP_LINKED_DOC:=no}
: ${SKIP_CLEAN:=no}
: ${ZITI_DOC_GIT_LOC:="${script_dir}/docusaurus/docs/_remotes"}
: ${SDK_ROOT_TARGET:="${script_dir}/docusaurus/static/docs/reference/developer/sdk"}
: ${ZITI_DOCUSAURUS:=yes}
: ${SKIP_DOCUSAURUS_GEN:=no}
: ${ZITI_GEN_ZIP:=no}
: ${BUILD_QUALIFIER:=""}

while getopts ":glcsdz" OPT; do
  case ${OPT} in
    g ) echo "- skipping git";             SKIP_GIT="yes" ;;
    l ) echo "- skipping linked docs";     SKIP_LINKED_DOC="yes" ;;
    c ) echo "- skipping clean";           CLEAN=0 ;;
    s ) echo "- including stargazer data"; ADD_STARGAZER_DATA="yes" ;;
    d ) echo "- skipping Docusaurus gen";  SKIP_DOCUSAURUS_GEN="yes" ;;
    z ) echo "- generating zip after build"; ZITI_GEN_ZIP="yes" ;;
    * ) echo "WARN: ignoring option ${OPTARG}" >&2 ;;
  esac
done
shift $((OPTIND -1))

echo "ARGS: $@"

clone_or_update() {
  local url="$1" dest="$2" branch="${3:-main}"
  local target="$script_dir/_remotes/$dest"

  if [ -d "$target/.git" ]; then
    if [ "$SKIP_CLEAN" = "no" ]; then
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

"${script_dir}/_remotes/openziti/gendoc.sh" $flags


if [[ "${SKIP_DOCUSAURUS_GEN}" == no ]]; then
  pushd "${script_dir}" >/dev/null
  yarn install
  date > static/build-time.txt
  echo "BUILDING docs into: build${BUILD_QUALIFIER}"
  yarn build --out-dir "build${BUILD_QUALIFIER}" 2>&1
  popd >/dev/null
fi

echo "build-docs complete"
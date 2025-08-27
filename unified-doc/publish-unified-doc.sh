#!/bin/bash

# This script is intended to be called from some form of CI which is able to publish
# the actual docs.

set -eu
pub_script_root="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
echo "publish script located in: $pub_script_root"

setup_ssh() {
  mkdir -p ~/.ssh
  if ! ssh-keygen -F github.com > /dev/null; then
    echo "using ssh-keyscan to add github.com to known hosts"
    ssh-keyscan github.com >> ~/.ssh/known_hosts
  fi
}


publish_docs() {
  local HOST=$1 PORT=$2 USER=$3 TARGET_DIR=$4
  echo "doc publication begins"
  echo "=== scp begins ==="
  scp -o StrictHostKeyChecking=accept-new \
    -P "$PORT" -i "${pub_script_root}/github_deploy_key" \
    /tmp/unified-docs.zip \
    "$USER@$HOST:/tmp" \
    2>&1
  echo "=== ssh commands ==="
  for CMD in \
    "rm -rf ${TARGET_DIR}/docs" \
    "mkdir -p ${TARGET_DIR}/docs" \
    "unzip -oq /tmp/unified-docs.zip -d ${TARGET_DIR}/docs"
  do
    ssh -p "$PORT" -i "${pub_script_root}/github_deploy_key" \
      "$USER@$HOST" "$CMD" 2>&1
  done
  echo "=== done ==="
  echo "doc published"
}


: ${SKIP_GIT:=no}
: ${SKIP_LINKED_DOC:=no}
: ${SKIP_CLEAN:=no}
ZITI_DOC_GIT_LOC="${pub_script_root}/docusaurus/docs/_remotes"
SDK_ROOT_TARGET="${pub_script_root}/docusaurus/static/docs/reference/developer/sdk"
: ${ZITI_DOCUSAURUS:=yes}
: ${SKIP_DOCUSAURUS_GEN:=no}
: ${ZITI_GEN_ZIP:=no}
: ${ADD_OPENZITI_STARGAZER_DATA:=no}

echo "- processing opts"

while getopts ":glcsdz" OPT; do
  case ${OPT} in
    g ) # skip git
      echo "- skipping creating and updating Git working copies"
      SKIP_GIT="yes"
      ;;
    l ) # skip linked doc gen
      echo "- skipping linked doc generation"
      SKIP_LINKED_DOC="yes"
      ;;
    c ) # skip clean steps
      echo "- skipping clean step that deletes Git working copies"
      SKIP_CLEAN="yes"
      ;;
    s ) # INCLUDE OpenZiti stargazer stuff
      echo "- fetching stargazer data as well"
      ADD_OPENZITI_STARGAZER_DATA="yes"
      ;;
    d ) # skip docusaurus gen
      echo "- skipping docusaurus generation"
      SKIP_DOCUSAURUS_GEN="yes"
      ;;
    z ) # generate a zip file
      echo "- generating a zip file after build"
      ZITI_GEN_ZIP="yes"
      ;;
    *)
      echo "WARN: ignoring option ${OPT}" >&2
      ;;
  esac
done

echo "- done processing opts"

target_branch="$1"
echo "incoming branch named: $target_branch"

setup_ssh "."
"${pub_script_root}/build-docs.sh"

echo "creating zip from built site"
rm /tmp/unified-docs.zip
zip -r "/tmp/unified-docs.zip" "${pub_script_root}/build"

if [ "${GIT_BRANCH:-}" == "${target_branch}" ]; then
  echo "========= on ${target_branch} branch - publishing to both main and staging"
  publish_docs "$STG_DOC_SSH_HOST" "$STG_DOC_SSH_PORT" \
               "$STG_DOC_SSH_USER" "$STG_DOC_SSH_TARGET_DIR"
  publish_docs "$PROD_DOC_SSH_HOST" "$PROD_DOC_SSH_PORT" \
               "$PROD_DOC_SSH_USER" "$PROD_DOC_SSH_TARGET_DIR"
else
  echo "========= on ${target_branch} branch - publishing to staging only"
  publish_docs "$STG_DOC_SSH_HOST" "$STG_DOC_SSH_PORT" \
               "$STG_DOC_SSH_USER" "$STG_DOC_SSH_TARGET_DIR"
fi
rm "${pub_script_root}/github_deploy_key"
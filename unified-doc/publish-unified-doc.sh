#!/bin/bash

# This script is intended to be called from some form of CI which is able to publish
# the actual docs.

set -eu
pub_script_root="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
echo "publish script located in: $pub_script_root"

publish_docs() {
  local HOST=$1 PORT=$2 USER=$3 TARGET_DIR=$4 BUILD_DIR=$5

  "${pub_script_root}/build-docs.sh" "${BUILD_DIR}"
  local zip_target="unified-docs-${BUILD_DIR}.zip"
  echo "creating zip from built site"
  pushd "${pub_script_root}/${BUILD_DIR}"
  zip -r "/tmp/${zip_target}" .
  popd

  echo "doc publication begins"
  echo "=== scp begins ==="
  scp -o StrictHostKeyChecking=accept-new \
    -P "$PORT" -i "${pub_script_root}/github_deploy_key" \
    "/tmp/${zip_target}" \
    "$USER@$HOST:/tmp" \
    2>&1
  echo "=== ssh commands ==="
  for CMD in \
    "rm -rf ${TARGET_DIR}/docs" \
    "mkdir -p ${TARGET_DIR}/docs" \
    "unzip -oq /tmp/${zip_target} -d ${TARGET_DIR}/docs"
  do
    ssh -p "$PORT" -i "${pub_script_root}/github_deploy_key" \
      "$USER@$HOST" "$CMD" 2>&1
  done
  echo "=== done ==="
  echo "doc published"
}

target_branch="$1"
echo "incoming branch named: $target_branch"


if [ "${GIT_BRANCH:-}" == "${target_branch}" ]; then
  echo "========= on ${target_branch} branch - publishing to both main and staging"
  publish_docs "$STG_DOC_SSH_HOST" "$STG_DOC_SSH_PORT" \
               "$STG_DOC_SSH_USER" "$STG_DOC_SSH_TARGET_DIR" "${pub_script_root}/build-stg" &
  publish_docs "$PROD_DOC_SSH_HOST" "$PROD_DOC_SSH_PORT" \
               "$PROD_DOC_SSH_USER" "$PROD_DOC_SSH_TARGET_DIR" "${pub_script_root}/build-prod" &
  wait
else
  echo "========= on ${target_branch} branch - publishing to staging only"
  publish_docs "$STG_DOC_SSH_HOST" "$STG_DOC_SSH_PORT" \
               "$STG_DOC_SSH_USER" "$STG_DOC_SSH_TARGET_DIR" "${pub_script_root}/build-stg"
fi
rm "${pub_script_root}/github_deploy_key"
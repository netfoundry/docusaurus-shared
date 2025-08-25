#!/bin/bash
set -eu

setup_ssh() {
  mkdir -p ~/.ssh
  if ! ssh-keygen -F github.com > /dev/null; then
    echo "using ssh-keyscan to add github.com to known hosts"
    ssh-keyscan github.com >> ~/.ssh/known_hosts
  fi
}

clone_publish_repo() {
  cd "$pub_script_root"
  echo "cloning actual github pages now to push docs into"
  git clone https://github.com/openziti/openziti.github.io.git
  rm -rf ./openziti.github.io/*
  cp -rT ./docusaurus/build/ ./openziti.github.io/
  echo "openziti.io" > ./openziti.github.io/CNAME
}

publish_docs() {
  local HOST=$1 PORT=$2 USER=$3 TARGET_DIR=$4
  echo "doc publication begins"
  echo "=== scp begins ==="
  scp -o StrictHostKeyChecking=accept-new \
    -P "$PORT" -i ./github_deploy_key \
    docs-openziti.zip \
    "$USER@$HOST:/tmp" \
    2>&1
  echo "=== ssh commands ==="
  for CMD in \
    "rm -rf ${TARGET_DIR}/docs/openziti" \
    "mkdir -p ${TARGET_DIR}/docs/openziti" \
    "unzip -oq /tmp/docs-openziti.zip -d ${TARGET_DIR}/docs/openziti"
  do
    ssh -p "$PORT" -i ./github_deploy_key \
      "$USER@$HOST" "$CMD" 2>&1
  done
  echo "=== done ==="
  echo "doc published"
}

pub_script_root="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
echo "publish script located in: $pub_script_root"

target_branch="$1"

echo "incoming branch named: $target_branch"

setup_ssh "."
echo "$(date)" > docusaurus/static/build-time.txt
./gendoc.sh -zs

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

rm ./github_deploy_key
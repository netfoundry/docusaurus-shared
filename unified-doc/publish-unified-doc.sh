#!/bin/bash

# This script is intended to be called from some form of CI which is able to publish
# the actual docs.

set -eu

flags=()
args=()

for arg in "$@"; do
  case "$arg" in
    -*)
      flags+=("$arg")
      ;;
    *)
      args+=("$arg")
      ;;
  esac
done

echo "Pub Flags: ${flags[*]}"
echo "Pub Args : ${args[*]}"

pub_script_root="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
echo "publish script located in: $pub_script_root"

qualifier="-site"
echo "build qualifier set: $qualifier"
"${pub_script_root}/build-docs.sh" --qualifier="$qualifier" "${flags[@]}"

# Generate llms.txt directly into the build output (remotes are still present at this point).
node "${pub_script_root}/scripts/generate-llms-txt.mjs" "${pub_script_root}/build${qualifier}/llms.txt"

# Inject llms.txt into the sitemap so crawlers can discover it.
SITEMAP="${pub_script_root}/build${qualifier}/sitemap.xml"
if [ -f "$SITEMAP" ]; then
    sed -i 's|</urlset>|  <url><loc>https://netfoundry.io/docs/llms.txt</loc><changefreq>daily</changefreq><priority>0.5</priority></url>\n</urlset>|' "$SITEMAP"
    echo "Injected llms.txt entry into sitemap.xml"
fi

publish_docs() {
  local HOST=$1 PORT=$2 USER=$3 TARGET_DIR=$4 KEY_FILE=$5
  local zip_target="unified-docs${qualifier}.zip"

  echo "creating zip from built site at /build${qualifier}"
  pushd "${pub_script_root}/build${qualifier}" >/dev/null
  zip -r "/tmp/${zip_target}" . 2>&1
  popd >/dev/null

  # isolated known_hosts
  local addr="[$HOST]:$PORT"
  local kh; kh="$(mktemp)"
  trap 'rm -f "$kh"' RETURN
  ssh-keyscan -p "$PORT" "$HOST" 2>&1 | \
    awk -v a="$addr" '{ $1=a; print }' > "$kh"
  chmod 600 "$kh" 2>&1

  echo "doc publication begins"
  echo "=== scp begins ==="
  scp -o UserKnownHostsFile="$kh" -o StrictHostKeyChecking=yes \
      -P "$PORT" -i "${KEY_FILE}" \
      "/tmp/${zip_target}" \
      "$USER@$HOST:/tmp" 2>&1

  echo "=== ssh commands ==="
  for CMD in \
    "rm -rf ${TARGET_DIR}/docs" \
    "mkdir -p ${TARGET_DIR}/docs" \
    "unzip -oq /tmp/${zip_target} -d ${TARGET_DIR}/docs"
  do
    ssh -o UserKnownHostsFile="$kh" -o StrictHostKeyChecking=yes \
        -p "$PORT" -i "${KEY_FILE}" \
        "$USER@$HOST" "$CMD" 2>&1
  done
  echo "=== done ==="
  echo "doc published"
}

publish_docs "$STG_DOC_SSH_HOST" "$STG_DOC_SSH_PORT" \
  "$STG_DOC_SSH_USER" "$STG_DOC_SSH_TARGET_DIR" "${STG_KEY_FILE/\$HOME/$HOME}"
  
publish_docs "$PROD_DOC_SSH_HOST" "$PROD_DOC_SSH_PORT" \
  "$PROD_DOC_SSH_USER" "$PROD_DOC_SSH_TARGET_DIR" "${PROD_KEY_FILE/\$HOME/$HOME}"






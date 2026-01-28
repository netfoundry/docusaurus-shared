#!/usr/bin/env bash
set -euo pipefail

# --- ARGUMENT PARSING ---
CLEAN=0
LINT_ONLY=0
BUILD_QUALIFIER=""
QUALIFIER_FLAG=()
OTHER_FLAGS=()
EXTRA_ARGS=()

for arg in "$@"; do
  case $arg in
    --clean) CLEAN=1; OTHER_FLAGS+=("$arg") ;;
    --lint-only) LINT_ONLY=1 ;;
    --qualifier=*) BUILD_QUALIFIER="${arg#*=}"; QUALIFIER_FLAG=("$arg") ;;
    -*) OTHER_FLAGS+=("$arg") ;;   # Pass through flags like -ds, -z
    *) EXTRA_ARGS+=("$arg") ;;
  esac
done

# --- DEBUG CONFIG ---
echo "bd CLEAN=$CLEAN"
echo "bd BUILD_QUALIFIER='$BUILD_QUALIFIER'"
echo "bd QUALIFIER_FLAG: ${QUALIFIER_FLAG[*]}"
echo "bd OTHER_FLAGS: ${OTHER_FLAGS[*]}"
echo "bd EXTRA_ARGS: ${EXTRA_ARGS[*]}"

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

clone_or_update() {
  local url="$1" dest="$2" branch="${3:-main}"
  local target="$script_dir/_remotes/$dest"

  echo "bd clone_or_update url='$url' dest='$dest' branch='$branch' target='$target' CLEAN='${CLEAN:-0}'"

  # --- AUTHENTICATION LOGIC ---
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
        local bb_user="${BB_USERNAME:-x-token-auth}"
        url="https://${bb_user}:${BB_REPO_TOKEN_ONPREM}@bitbucket.org/netfoundry/k8s-on-prem-installations.git"
        echo "🔑 Using BB_REPO_TOKEN_ONPREM token" >&2
      else
        url="git@bitbucket.org:netfoundry/k8s-on-prem-installations.git"
        echo "🔑 Using SSH for onprem" >&2
      fi
      ;;
    *zrok-connector*)
      if [ -n "${BB_REPO_TOKEN_FRONTDOOR:-}" ]; then
        local bb_user="${BB_USERNAME:-x-token-auth}"
        url="https://${bb_user}:${BB_REPO_TOKEN_FRONTDOOR}@bitbucket.org/netfoundry/zrok-connector.git"
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

  echo "bd clone_or_update effective_url='${url//:*@/://[REDACTED]@}'"

  echo "bd precheck target_exists=$([ -d "$target" ] && echo 1 || echo 0) git_dir_exists=$([ -d "$target/.git" ] && echo 1 || echo 0)"
  if [ -d "$target" ]; then
    echo "bd precheck target_listing:"
    ls -la "$target" 2>&1 || true
  fi

  echo "bd attempting clone: branch='$branch' depth=1 -> '$target'"
  if ! git clone --single-branch --branch "$branch" --depth 1 "$url" "$target" 2>&1; then
    echo "bd clone failed; inspecting existing target..."
    echo "bd postclone target_exists=$([ -d "$target" ] && echo 1 || echo 0) git_dir_exists=$([ -d "$target/.git" ] && echo 1 || echo 0)"

    if [ -d "$target" ]; then
      if [ -d "$target/.git" ]; then
        echo "bd existing repo detected; setting origin url and fetching branch '$branch'"
        git -C "$target" remote set-url origin "$url" 2>&1 || git -C "$target" remote add origin "$url" 2>&1 || true
        echo "bd remotes:"
        git -C "$target" remote -v 2>&1 || true
        echo "bd fetch+reset..."
        if ! git -C "$target" fetch --depth 1 origin "$branch" 2>&1 \
              || ! git -C "$target" reset --hard FETCH_HEAD 2>&1; then
          echo "❌ Branch '$branch' not found in ${url//:*@/://[REDACTED]@}"
          echo "👉 Available branches:"
          git ls-remote --heads "$url" | awk '{print $2}' | sed 's|refs/heads/||'
          exit 1
        fi
      else
        echo "❌ ${target} exists but is not a git repo."
        echo "bd target top-level listing:"
        ls -la "$target" 2>&1 || true
        exit 1
      fi
    else
      echo "❌ Branch '$branch' not found in ${url//:*@/://[REDACTED]@}"
      echo "👉 Available branches:"
      git ls-remote --heads "$url" | awk '{print $2}' | sed 's|refs/heads/||'
      exit 1
    fi
  fi
}

lint_docs() {
    echo "🔍 Starting Quality Checks..."

    # 1. DEFINE TARGETS
    POTENTIAL_TARGETS=(
        "${script_dir}/_remotes/zlan/docusaurus/docs"
        "${script_dir}/_remotes/frontdoor/docusaurus/docs"
        "${script_dir}/_remotes/zrok/website/docs"
        "${script_dir}/_remotes/onprem/docusaurus/docs"
        "${script_dir}/_remotes/openziti/docusaurus/docs"
    )

    # 2. VERIFY FOLDERS
    VALID_TARGETS=()
    for target in "${POTENTIAL_TARGETS[@]}"; do
        if [ -d "$target" ]; then
            VALID_TARGETS+=("$target")
        fi
    done

    if [ ${#VALID_TARGETS[@]} -eq 0 ]; then
        echo "⚠️  No documentation directories found. Skipping lint."
        return
    fi

    # 3. GENERATE CLEAN FILE LIST
    echo "🎯 Gathering file list..."
    LIST_FILE=$(mktemp)

    find "${VALID_TARGETS[@]}" -type f \( -name "*.md" -o -name "*.mdx" \) \
        | grep -v "/node_modules/" \
        | grep -v "/docs/_remotes/" \
        | grep -v "/versioned_docs/" \
        | grep -v "/build/" \
        | grep -v "/.git/" \
        | grep -v "/_partials/" \
        | grep -v "/_[^/]*$" \
        > "$LIST_FILE"

    FILE_COUNT=$(wc -l < "$LIST_FILE")
    echo "📊 Found $FILE_COUNT files to scan..."

    if [ "$FILE_COUNT" -eq 0 ]; then
        echo "⚠️  No files found. Skipping."
        rm "$LIST_FILE"
        return
    fi

    # 4. RUN LINTERS & CAPTURE
    VALE_LOG=$(mktemp)
    MDLINT_LOG=$(mktemp)

    # --- Run Vale ---
    if command -v vale &> /dev/null; then
        echo "📝 Running Vale..."
        tr '\n' '\0' < "$LIST_FILE" | xargs -0 -r timeout 2m vale \
            --config "${script_dir}/../docs-linter/.vale.ini" \
            --no-wrap \
            --no-exit \
            > "$VALE_LOG" 2>&1
    fi

    # --- Run Markdownlint ---
    if command -v markdownlint &> /dev/null; then
        echo "🧹 Running Markdownlint..."
        tr '\n' '\0' < "$LIST_FILE" | xargs -0 -r timeout 2m markdownlint \
            --config "${script_dir}/../docs-linter/.markdownlint.json" \
            > "$MDLINT_LOG" 2>&1 || true
    fi

    # 5. FORMAT & CLEAN LOGS
    VALE_CLEAN=$(mktemp)
    sed "s|.*/_remotes/|_remotes/|g" "$VALE_LOG" | sed 's/\x1b\[[0-9;]*m//g' > "$VALE_CLEAN"

    MDLINT_CLEAN=$(mktemp)
    sed "s|.*/_remotes/|_remotes/|g" "$MDLINT_LOG" | sed 's/\x1b\[[0-9;]*m//g' | \
    awk -F: '
        $1!=last { if(NR>1)print""; print $1; last=$1 }
        { $1=""; print "  " substr($0,2) }
    ' > "$MDLINT_CLEAN"

    # 6. CALCULATE STATS
    V_ERR=$(grep -c "error" "$VALE_CLEAN" || true)
    V_WARN=$(grep -c "warning" "$VALE_CLEAN" || true)
    V_SUG=$(grep -c "suggestion" "$VALE_CLEAN" || true)
    MD_ERR=$(grep -c "^  " "$MDLINT_CLEAN" || true)

    TOTAL_ISSUES=$((V_ERR + V_WARN + V_SUG + MD_ERR))

    # 7. PRINT SUMMARY REPORT
    echo ""
    echo "========================================================"
    echo "📊  QUALITY CHECK SUMMARY"
    echo "========================================================"
    echo "  📄 Files Scanned:       $FILE_COUNT"
    echo "  🛑 Vale Errors:         $V_ERR"
    echo "  ⚠️ Vale Warnings:       $V_WARN"
    echo "  💡 Vale Suggestions:    $V_SUG"
    echo "  🧹 Markdownlint Issues: $MD_ERR"
    echo "--------------------------------------------------------"
    echo "  🚨 TOTAL ISSUES:        $TOTAL_ISSUES"
    echo "========================================================"
    echo ""

    if [ "$MD_ERR" -gt 0 ]; then
        echo "################### MARKDOWNLINT REPORT ###################"
        cat "$MDLINT_CLEAN"
        echo ""
    fi

    if [ $((V_ERR + V_WARN + V_SUG)) -gt 0 ]; then
        echo "####################### VALE REPORT #######################"
        cat "$VALE_CLEAN"

        if [ "$MD_ERR" -gt 0 ]; then
             echo "🛑 BUT WAIT! You also have $MD_ERR Markdownlint errors (see above)."
        fi
        echo ""
    fi

    # Cleanup
    rm "$LIST_FILE" "$VALE_LOG" "$MDLINT_LOG" "$VALE_CLEAN" "$MDLINT_CLEAN"

    echo "✅ Quality Checks Complete."
}

# =============================================================================
# MAIN EXECUTION
# =============================================================================
echo "bd DEBUG: scanning for git dirs under _remotes"
find "$script_dir/_remotes" -name .git -type d 2>&1 || true


if [ "${CLEAN:-0}" -eq 1 ]; then
  echo "bd CLEAN=1 removing remotes root: '$script_dir/_remotes'"
  rm -rf "$script_dir/_remotes"
fi

clone_or_update "https://bitbucket.org/netfoundry/zrok-connector.git"            frontdoor develop
clone_or_update "https://bitbucket.org/netfoundry/k8s-on-prem-installations.git" onprem    update-to-theme
clone_or_update "https://github.com/openziti/ziti-doc.git"                       openziti  update-to-theme
clone_or_update "https://github.com/netfoundry/zlan.git"                         zlan      use-theme
clone_or_update "https://github.com/openziti/zrok.git"                           zrok      update-to-theme

echo "copying versionable docs locally..."
"${script_dir}/sync-versioned-remote.sh" zrok

# --- STEP 1: LINT ---
lint_docs

if [ "$LINT_ONLY" -eq 1 ]; then
    echo "🛑 --lint-only specified. Exiting before build."
    exit 0
fi

# --- STEP 2: BUILD SDKs ---
export SDK_ROOT_TARGET="${script_dir}/static/openziti/reference/developer/sdk"
echo "creating openziti SDK target if necessary at: ${SDK_ROOT_TARGET}"
mkdir -p "${SDK_ROOT_TARGET}"

"${script_dir}/_remotes/openziti/gendoc.sh" "${OTHER_FLAGS[@]}"

# --- STEP 3: DOCUSAURUS BUILD ---
pushd "${script_dir}" >/dev/null
yarn install
now=$(date)
echo "$now" > "${script_dir}/static/build-time.txt"
echo "BUILDING docs into: build${BUILD_QUALIFIER} at $now"
yarn build --out-dir "build${BUILD_QUALIFIER}" 2>&1
popd >/dev/null

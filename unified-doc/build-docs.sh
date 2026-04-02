#!/usr/bin/env bash
# =============================================================================
# build-docs.sh — Build the unified NetFoundry documentation site.
#
# Clones (or updates) all product doc repos into _remotes/, runs lint checks,
# builds SDK reference docs via ziti-doc's gendoc.sh, then runs a Docusaurus
# production build.
#
# USAGE
#   build-docs.sh [OPTIONS]
#
# OPTIONS
#   --ziti-doc-branch=BRANCH     Branch for openziti/ziti-doc                    (default: main)
#   --zrok-branch=BRANCH         Branch for openziti/zrok                         (default: main)
#   --frontdoor-branch=BRANCH    Branch for netfoundry/zrok-connector             (default: develop)
#   --selfhosted-branch=BRANCH   Branch for netfoundry/k8s-on-prem-installations  (default: main)
#   --zlan-branch=BRANCH         Branch for netfoundry/zlan                       (default: main)
#   --clean                      Wipe _remotes and .docusaurus cache before building
#   --lint-only                  Run lint checks only; skip build
#   --qualifier=VALUE            Append VALUE to output dir (e.g. --qualifier=-preview -> build-preview)
#   -l                           (gendoc) Skip linked doc generation (doxygen/wget)
#   -g                           (gendoc) Skip git clones inside gendoc
#   -c                           (gendoc) Skip clean steps inside gendoc
#   -h, --help                   Show this help and exit
#
# ENVIRONMENT VARIABLES
#   GH_ZITI_CI_REPO_ACCESS_PAT   GitHub PAT for ziti-doc and zlan (falls back to SSH)
#   BB_REPO_TOKEN_FRONTDOOR      Bitbucket token for zrok-connector (falls back to SSH)
#   BB_REPO_TOKEN_ONPREM         Bitbucket token for k8s-on-prem-installations (falls back to SSH)
#   BB_USERNAME                  Bitbucket username (default: x-token-auth)
#   DOCUSAURUS_BUILD_MASK        Hex bitmask: 0x1=openziti 0x2=frontdoor 0x4=selfhosted
#                                             0x8=zrok 0x10=zlan 0xFF=all (default: 0xFF)
#   DOCUSAURUS_PUBLISH_ENV       Set to 'prod' to use production Algolia index
#   NO_MINIFY                    Set to any value to pass --no-minify to Docusaurus
#   IS_VERCEL                    Set to 'true' on Vercel preview deployments
#
# EXAMPLES
#   ./build-docs.sh --ziti-doc-branch=my.branch.name
#   DOCUSAURUS_BUILD_MASK=0x1 ./build-docs.sh --ziti-doc-branch=my.branch.name
#   ./build-docs.sh --clean --lint-only
#   ./build-docs.sh --qualifier=-preview -l
# =============================================================================
set -euo pipefail

# --- ARGUMENT PARSING ---
CLEAN=0
LINT_ONLY=0
BUILD_QUALIFIER=""
QUALIFIER_FLAG=()
OTHER_FLAGS=()
EXTRA_ARGS=()

BRANCH_ZITI_DOC="main"
BRANCH_ZROK="main"
BRANCH_FRONTDOOR="develop"
BRANCH_SELFHOSTED="main"
BRANCH_ZLAN="main"

usage() {
  sed -n '/^# USAGE/,/^# =====/{ /^# =====/d; s/^# \{0,1\}//; p }' "$0"
}

while [[ $# -gt 0 ]]; do
  case $1 in
    --ziti-doc-branch=*)    BRANCH_ZITI_DOC="${1#*=}";    shift ;;
    --zrok-branch=*)        BRANCH_ZROK="${1#*=}";        shift ;;
    --frontdoor-branch=*)   BRANCH_FRONTDOOR="${1#*=}";   shift ;;
    --selfhosted-branch=*)  BRANCH_SELFHOSTED="${1#*=}";  shift ;;
    --zlan-branch=*)        BRANCH_ZLAN="${1#*=}";        shift ;;
    --ziti-doc-branch)      BRANCH_ZITI_DOC="${2:?--ziti-doc-branch requires a value}";     shift 2 ;;
    --zrok-branch)          BRANCH_ZROK="${2:?--zrok-branch requires a value}";             shift 2 ;;
    --frontdoor-branch)     BRANCH_FRONTDOOR="${2:?--frontdoor-branch requires a value}";   shift 2 ;;
    --selfhosted-branch)    BRANCH_SELFHOSTED="${2:?--selfhosted-branch requires a value}"; shift 2 ;;
    --zlan-branch)          BRANCH_ZLAN="${2:?--zlan-branch requires a value}";             shift 2 ;;
    --clean) CLEAN=1; shift ;;
    --lint-only) LINT_ONLY=1; shift ;;
    -h|--help) usage; exit 0 ;;
    --qualifier=*) BUILD_QUALIFIER="${1#*=}"; QUALIFIER_FLAG=("$1"); shift ;;
    --qualifier)
      if [[ -n "${2:-}" && ! "$2" =~ ^- ]]; then
        BUILD_QUALIFIER="$2"; QUALIFIER_FLAG=("--qualifier=$2"); shift 2
      else
        echo "Error: --qualifier requires a value" >&2; exit 1
      fi
      ;;
    -*) OTHER_FLAGS+=("$1"); shift ;;
    *) EXTRA_ARGS+=("$1"); shift ;;
  esac
done

# --- DEBUG CONFIG ---
echo "========================================"
echo "bd BUILD ENVIRONMENT DEBUG"
echo "========================================"
echo "bd CLEAN=$CLEAN"
echo "bd BUILD_QUALIFIER='$BUILD_QUALIFIER'"
echo "bd QUALIFIER_FLAG: ${QUALIFIER_FLAG[*]:-}"
echo "bd OTHER_FLAGS: ${OTHER_FLAGS[*]:-}"
echo "bd EXTRA_ARGS: ${EXTRA_ARGS[*]:-}"
echo "bd BRANCH_ZITI_DOC='$BRANCH_ZITI_DOC'"
echo "bd BRANCH_ZROK='$BRANCH_ZROK'"
echo "bd BRANCH_FRONTDOOR='$BRANCH_FRONTDOOR'"
echo "bd BRANCH_SELFHOSTED='$BRANCH_SELFHOSTED'"
echo "bd BRANCH_ZLAN='$BRANCH_ZLAN'"
echo "----------------------------------------"
echo "bd ENV VARS:"
echo "bd   IS_VERCEL='${IS_VERCEL:-}'"
echo "bd   VERCEL='${VERCEL:-}'"
echo "bd   VERCEL_ENV='${VERCEL_ENV:-}'"
echo "bd   CI='${CI:-}'"
echo "bd   NODE_ENV='${NODE_ENV:-}'"
echo "bd   PWD='$(pwd)'"
echo "----------------------------------------"
echo "bd VERSIONS:"
echo "bd   node: $(node --version 2>/dev/null || echo 'not found')"
echo "bd   yarn: $(yarn --version 2>/dev/null || echo 'not found')"
echo "bd   npm: $(npm --version 2>/dev/null || echo 'not found')"
echo "========================================"

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
        echo "🔑 Using SSH for self-hosted" >&2
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

  if [ -d "$target/.git" ]; then
    echo "bd existing repo detected; fetching branch '$branch'"
    git -C "$target" remote set-url origin "$url" 2>&1 || git -C "$target" remote add origin "$url" 2>&1 || true
    if ! git -C "$target" fetch --depth 1 origin "$branch" 2>&1 \
          || ! git -C "$target" reset --hard FETCH_HEAD 2>&1; then
      echo "❌ Branch '$branch' not found in ${url//:*@/://[REDACTED]@}"
      echo "👉 Available branches:"
      git ls-remote --heads "$url" | awk '{print $2}' | sed 's|refs/heads/||'
      exit 1
    fi
    echo "bd fetch+reset succeeded"
  elif [ -d "$target" ]; then
    echo "❌ ${target} exists but is not a git repo."
    ls -la "$target" 2>&1 || true
    exit 1
  else
    echo "bd cloning branch '$branch' -> '$target'"
    if ! git clone --single-branch --branch "$branch" --depth 1 "$url" "$target" 2>&1; then
      echo "❌ Clone failed. Available branches in ${url//:*@/://[REDACTED]@}:"
      git ls-remote --heads "$url" | awk '{print $2}' | sed 's|refs/heads/||'
      exit 1
    fi
    echo "bd clone succeeded"
  fi
}

lint_docs() {
    echo "🔍 Starting Quality Checks..."

    # 1. DEFINE TARGETS
    POTENTIAL_TARGETS=(
        "${script_dir}/_remotes/zlan/docusaurus/docs"
        "${script_dir}/_remotes/frontdoor/docusaurus/docs"
        "${script_dir}/_remotes/zrok/website/docs"
        "${script_dir}/_remotes/selfhosted/docusaurus/docs"
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
  echo "bd CLEAN=1 removing contents of _remotes (preserving package.json)"
  find "$script_dir/_remotes" -mindepth 1 -maxdepth 1 ! -name 'package.json' -exec rm -rf {} +
fi

clone_or_update "https://bitbucket.org/netfoundry/zrok-connector.git"            frontdoor  "$BRANCH_FRONTDOOR"
clone_or_update "https://bitbucket.org/netfoundry/k8s-on-prem-installations.git" selfhosted "$BRANCH_SELFHOSTED"
clone_or_update "https://github.com/openziti/ziti-doc.git"                       openziti   "$BRANCH_ZITI_DOC"
clone_or_update "https://github.com/netfoundry/zlan.git"                         zlan       "$BRANCH_ZLAN"
clone_or_update "https://github.com/openziti/zrok.git"                           zrok       "$BRANCH_ZROK"

echo "========================================"
echo "bd POST-CLONE DEBUG"
echo "========================================"
echo "bd Directories in _remotes:"
ls -la "$script_dir/_remotes" 2>/dev/null || echo "  (none)"
echo "----------------------------------------"
echo "bd Looking for docusaurus build/ and .docusaurus/ dirs in remotes:"
find "$script_dir/_remotes" -type d \( -path "*/docusaurus/build" -o -path "*/docusaurus/.docusaurus" -o -path "*/website/build" -o -path "*/website/.docusaurus" \) 2>/dev/null || echo "  (none found)"
echo "bd Cleaning stale build artifacts from remotes..."
find "$script_dir/_remotes" -type d \( -path "*/docusaurus/build" -o -path "*/docusaurus/.docusaurus" -o -path "*/website/build" -o -path "*/website/.docusaurus" \) -exec rm -rf {} + 2>/dev/null || true
echo "========================================"

echo "copying versionable docs locally..."
"${script_dir}/sync-versioned-remote.sh" zrok

# --- LINT DOCS ---
lint_docs

if [ "$LINT_ONLY" -eq 1 ]; then
    echo "🛑 --lint-only specified. Exiting before build."
    exit 0
fi

# --- BUILD OPENZITI SDK REFERENCE DOCS ---
export SDK_ROOT_TARGET="${script_dir}/static/openziti/reference/developer/sdk"
echo "creating openziti SDK target if necessary at: ${SDK_ROOT_TARGET}"
mkdir -p "${SDK_ROOT_TARGET}"

# -d = skip docusaurus build (unified-doc does its own build)
"${script_dir}/_remotes/openziti/gendoc.sh" -d "${OTHER_FLAGS[@]}"

# --- DOCUSAURUS BUILD ---
pushd "${script_dir}" >/dev/null
yarn install

if [ "${CLEAN:-0}" -eq 1 ]; then
  echo "bd CLEAN=1: running yarn clear to remove .docusaurus cache"
  yarn clear
fi

echo "========================================"
echo "bd PRE-BUILD DEBUG"
echo "========================================"
echo "bd   IS_VERCEL='${IS_VERCEL:-}'"
echo "bd   VERCEL='${VERCEL:-}'"
echo "bd   script_dir='${script_dir}'"
echo "bd   BUILD_QUALIFIER='${BUILD_QUALIFIER}'"
echo "bd   output dir: build${BUILD_QUALIFIER}"
echo "========================================"

now=$(date)
commit=$(git -C "${script_dir}" rev-parse --short HEAD 2>/dev/null || echo "unknown")
printf "%s\n%s\n" "$now" "$commit" > "${script_dir}/static/build-time.txt"
echo "BUILDING docs into: build${BUILD_QUALIFIER} at $now"

MINIFY_FLAG=""
if [ -n "${NO_MINIFY:-}" ]; then
  MINIFY_FLAG="--no-minify"
fi
echo "NO_MINIFY flag: $MINIFY_FLAG"

yarn build $MINIFY_FLAG --out-dir "build${BUILD_QUALIFIER}" 2>&1
popd >/dev/null

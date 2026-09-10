#!/bin/bash

# --- CONFIGURATION ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_DIR="$SCRIPT_DIR"
TARGET_DIR="${1:-.}"

# --- VALIDATION ---
if [ ! -f "$CONFIG_DIR/.vale.ini" ]; then
    echo "❌ Error: .vale.ini not found in $CONFIG_DIR"
    exit 1
fi

if [ ! -d "$TARGET_DIR" ]; then
    echo "❌ Error: Target '$TARGET_DIR' does not exist."
    exit 1
fi

# --- TOOLCHECK ---
# Vale shells out to mdx2vast for every .mdx file. When that binary is missing,
# Vale does not fail the run -- it emits one "E100 [lintMDX] Runtime error" per
# file and keeps going, so every .mdx goes unlinted while the summary still
# looks healthy. Report what is actually installed before linting anything.
echo "🔧 Toolcheck..."

check_tool() {
    local name="$1" required="$2" note="$3"
    local path version
    path=$(command -v "$name" 2>/dev/null)
    if [ -z "$path" ]; then
        if [ "$required" = "required" ]; then
            echo "  ❌ $name: NOT FOUND -- $note"
            MISSING_REQUIRED=1
        else
            echo "  ⚠️  $name: NOT FOUND -- $note"
        fi
        return
    fi
    version=$("$name" --version 2>&1 | head -n1 | tr -d '\r')
    echo "  ✅ $name: ${version:-unknown} ($path)"
}

MISSING_REQUIRED=0
check_tool vale       required "install from https://vale.sh (CI pins the version in .github/workflows/vale-check.yml)"
check_tool markdownlint required "npm install -g markdownlint-cli"
check_tool mdx2vast   required "npm install -g mdx2vast -- without it every .mdx file is skipped"

if [ "$MISSING_REQUIRED" -ne 0 ]; then
    echo "❌ Toolchain incomplete. Install the tools above and re-run."
    exit 1
fi

# --- TEMP FILES ---
LIST_FILE=$(mktemp)
VALE_LOG=$(mktemp)
MD_LOG=$(mktemp)
VALE_CLEAN=$(mktemp)
MD_CLEAN=$(mktemp)

# --- GATHER FILES ---
echo "🎯 Gathering files from '$TARGET_DIR'..."

find "$TARGET_DIR" -type f \( -name "*.md" -o -name "*.mdx" \) \
    | grep -vE "/(node_modules|versioned_docs)/" \
    | grep -v "/_" \
    > "$LIST_FILE"

FILE_COUNT=$(wc -l < "$LIST_FILE")
echo "📊 Found $FILE_COUNT files to scan..."

if [ "$FILE_COUNT" -eq 0 ]; then
    echo "⚠️  No files found."
    rm "$LIST_FILE" "$VALE_LOG" "$MD_LOG"
    exit 0
fi

# --- EXECUTION ---
# 1. Run Vale
if command -v vale &> /dev/null; then
    echo "📝 Running Vale..."
    tr '\n' '\0' < "$LIST_FILE" | xargs -0 -r timeout 5m vale \
        --config "$CONFIG_DIR/.vale.ini" \
        --no-wrap --no-exit > "$VALE_LOG" 2>&1
else
    echo "⚠️  Vale not installed. Skipping."
fi

# 2. Run Markdownlint
if command -v markdownlint &> /dev/null; then
    echo "🧹 Running Markdownlint..."
    tr '\n' '\0' < "$LIST_FILE" | xargs -0 -r timeout 5m markdownlint \
        --config "$CONFIG_DIR/.markdownlint.json" \
        > "$MD_LOG" 2>&1 || true
else
    echo "⚠️  Markdownlint not installed. Skipping."
fi

# --- FORMAT LOG OUTPUT ---
CWD=$(pwd)

sed "s|$CWD/||g" "$VALE_LOG" | sed 's/\x1b\[[0-9;]*m//g' > "$VALE_CLEAN"
sed "s|$CWD/||g" "$MD_LOG" | sed 's/\x1b\[[0-9;]*m//g' | \
awk -F: '
    $1!=last { if(NR>1)print""; print $1; last=$1 }
    { $1=""; print "  " substr($0,2) }
' > "$MD_CLEAN"

# --- SUMMARY ---
V_ERR=$(grep -c " error " "$VALE_CLEAN" || true)
V_WARN=$(grep -c " warning " "$VALE_CLEAN" || true)
V_SUG=$(grep -c " suggestion " "$VALE_CLEAN" || true)
# E100 lines carry no severity token, so they slip past the three greps above.
# Count them separately: each one is a file Vale gave up on, not a clean file.
V_RUN=$(grep -c "^E100 " "$VALE_CLEAN" || true)
MD_ERR=$(grep -c "^  " "$MD_CLEAN" || true)
TOTAL=$((V_ERR + V_WARN + V_SUG + V_RUN + MD_ERR))

echo -e "\n========================================================"
echo "📊  LINT SUMMARY"
echo "========================================================"
echo "  📄 Files Scanned:       $FILE_COUNT"
echo "  🛑 Vale Errors:         $V_ERR"
echo "  ⚠️  Vale Warnings:       $V_WARN"
echo "  💡 Vale Suggestions:    $V_SUG"
echo "  💥 Vale Runtime Errors: $V_RUN"
echo "  🧹 Markdownlint Issues: $MD_ERR"
echo "--------------------------------------------------------"
echo "  🚨 TOTAL ISSUES:        $TOTAL"
echo -e "========================================================\n"

# --- REPORTING ---
if [ "$MD_ERR" -gt 0 ]; then
    echo "################### MARKDOWNLINT REPORT ###################"
    cat "$MD_CLEAN"
    echo ""
fi

# Check if Vale actually ran (output is not empty)
if [ -s "$VALE_CLEAN" ]; then
    echo "####################### VALE REPORT #######################"
    cat "$VALE_CLEAN"
    if [ "$MD_ERR" -gt 0 ]; then
         echo "🛑 BUT WAIT! You also have $MD_ERR Markdownlint errors (see above)."
    fi
    echo ""
fi

# --- REMOVE TEMP FILES ---
rm "$LIST_FILE" "$VALE_LOG" "$MD_LOG" "$VALE_CLEAN" "$MD_CLEAN"

[ "$TOTAL" -eq 0 ] || exit 1

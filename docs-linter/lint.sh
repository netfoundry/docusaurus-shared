#!/bin/bash

# --- 1. SETUP PATHS ---
# Determine where this script is located (inside docs-linter)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# The config files are now in the SAME directory as the script
CONFIG_DIR="$SCRIPT_DIR"

# The target to scan is the first argument, or current directory if empty
TARGET_DIR="${1:-.}"

# --- 2. VALIDATION ---
if [ ! -f "$CONFIG_DIR/.vale.ini" ]; then
    echo "❌ Error: Could not find .vale.ini in $CONFIG_DIR"
    exit 1
fi

if [ ! -d "$TARGET_DIR" ]; then
    echo "❌ Error: Target directory '$TARGET_DIR' does not exist."
    exit 1
fi

# --- 3. PREPARE TEMPORARY LOGS ---
LIST_FILE=$(mktemp)
VALE_LOG=$(mktemp)
MD_LOG=$(mktemp)
VALE_CLEAN=$(mktemp)
MD_CLEAN=$(mktemp)

# --- 4. GATHER FILES ---
echo "🎯 Gathering file list from '$TARGET_DIR'..."

# Find markdown files, ignoring node_modules, remotes, and versioned docs
find "$TARGET_DIR" -type f \( -name "*.md" -o -name "*.mdx" \) \
    | grep -v "/node_modules/" \
    | grep -v "/_remotes/" \
    | grep -v "/versioned_docs/" \
    > "$LIST_FILE"

FILE_COUNT=$(wc -l < "$LIST_FILE")
echo "📊 Found $FILE_COUNT files to scan..."

if [ "$FILE_COUNT" -eq 0 ]; then
    echo "⚠️  No files found to scan."
    rm "$LIST_FILE" "$VALE_LOG" "$MD_LOG"
    exit 0
fi

# --- 5. RUN LINTERS ---

# Check if Vale is installed
if command -v vale &> /dev/null; then
    echo "📝 Running Vale..."
    tr '\n' '\0' < "$LIST_FILE" | xargs -0 -r timeout 5m vale \
        --config "$CONFIG_DIR/.vale.ini" \
        --no-wrap \
        --no-exit \
        > "$VALE_LOG" 2>&1
else
    echo "⚠️  Vale is not installed. Skipping."
fi

# Check if Markdownlint is installed
if command -v markdownlint &> /dev/null; then
    echo "🧹 Running Markdownlint..."
    tr '\n' '\0' < "$LIST_FILE" | xargs -0 -r timeout 5m markdownlint \
        --config "$CONFIG_DIR/.markdownlint.json" \
        > "$MD_LOG" 2>&1 || true
else
    echo "⚠️  Markdownlint is not installed. Skipping."
fi

# --- 6. FORMAT OUTPUT ---
# Strip absolute paths for readability
CWD=$(pwd)
sed "s|$CWD/||g" "$VALE_LOG" | sed 's/\x1b\[[0-9;]*m//g' > "$VALE_CLEAN"

sed "s|$CWD/||g" "$MD_LOG" | sed 's/\x1b\[[0-9;]*m//g' | \
awk -F: '
    $1!=last { if(NR>1)print""; print $1; last=$1 }
    { $1=""; print "  " substr($0,2) }
' > "$MD_CLEAN"

# --- 7. SUMMARY & REPORT ---
V_ERR=$(grep -c "error" "$VALE_CLEAN" || true)
V_WARN=$(grep -c "warning" "$VALE_CLEAN" || true)
V_SUG=$(grep -c "suggestion" "$VALE_CLEAN" || true)
MD_ERR=$(grep -c "^  " "$MD_CLEAN" || true)
TOTAL=$((V_ERR + V_WARN + V_SUG + MD_ERR))

echo ""
echo "========================================================"
echo "📊  LINT SUMMARY"
echo "========================================================"
echo "  📄 Files Scanned:       $FILE_COUNT"
echo "  🛑 Vale Errors:         $V_ERR"
echo "  ⚠️  Vale Warnings:       $V_WARN"
echo "  💡 Vale Suggestions:    $V_SUG"
echo "  🧹 Markdownlint Issues: $MD_ERR"
echo "--------------------------------------------------------"
echo "  🚨 TOTAL ISSUES:        $TOTAL"
echo "========================================================"
echo ""

if [ "$MD_ERR" -gt 0 ]; then
    echo "########################################################"
    echo "   MARKDOWNLINT REPORT"
    echo "########################################################"
    cat "$MD_CLEAN"
    echo ""
fi

if [ $((V_ERR + V_WARN + V_SUG)) -gt 0 ]; then
    echo "########################################################"
    echo "   VALE REPORT"
    echo "########################################################"
    cat "$VALE_CLEAN"
    echo ""
fi

# Cleanup
rm "$LIST_FILE" "$VALE_LOG" "$MD_LOG" "$VALE_CLEAN" "$MD_CLEAN"

# Optional: Exit with failure if errors found
# [ "$TOTAL" -gt 0 ] && exit 1 || exit 0
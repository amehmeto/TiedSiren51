#!/bin/bash
# Hook: PreToolUse for Edit tool
# Reminds Claude to follow testing ADRs when editing test files

# Get the file path from the tool input (passed as JSON via stdin)
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Exit silently if not a test file
if [[ ! "$FILE_PATH" =~ \.(test|spec)\.(ts|tsx)$ ]]; then
  exit 0
fi

echo "=========================================="
echo "⚠️  EDITING TEST FILE - REVIEW TESTING ADRs"
echo "=========================================="
echo ""

ADR_DIR="docs/adr/testing"

for adr in "$ADR_DIR"/*.md; do
  if [[ -f "$adr" ]]; then
    filename=$(basename "$adr")
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📄 $filename"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    cat "$adr"
    echo ""
    echo ""
  fi
done

echo "=========================================="
echo "END OF TESTING ADRs"
echo "=========================================="

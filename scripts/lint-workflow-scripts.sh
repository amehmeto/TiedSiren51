#!/usr/bin/env bash
# Lint GitHub Actions workflow files for inline scripts
# Fails if any run: or script: block exceeds its line limit
# Long scripts should be extracted to scripts/ directory

set -euo pipefail

MAX_RUN_LINES=3      # run: | blocks (shell)
MAX_SCRIPT_LINES=2   # script: | blocks (JS for actions/github-script)
FOUND_ISSUES=0

# Colors for output
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

check_file() {
  local file="$1"
  local in_block=false
  local block_start=0
  local block_lines=0
  local block_type=""
  local max_lines=0
  local line_num=0
  local base_indent=""
  local trailing_empty=0

  while IFS= read -r line || [[ -n "$line" ]]; do
    ((++line_num))

    # Detect start of multi-line block (run: | or script: |)
    if [[ "$line" =~ ^([[:space:]]*)(-[[:space:]]+)?(run|script):[[:space:]]*\|[[:space:]]*$ ]]; then
      in_block=true
      block_start=$line_num
      block_lines=0
      trailing_empty=0
      block_type="${BASH_REMATCH[3]}"
      if [[ "$block_type" == "script" ]]; then
        max_lines=$MAX_SCRIPT_LINES
      else
        max_lines=$MAX_RUN_LINES
      fi
      # Capture the indentation level
      base_indent="${BASH_REMATCH[1]}${BASH_REMATCH[2]}"
      continue
    fi

    # If we're in a block
    if [[ "$in_block" == true ]]; then
      # Check if this line is still part of the block (more indented or empty)
      if [[ "$line" =~ ^([[:space:]]*) ]]; then
        current_indent="${BASH_REMATCH[1]}"

        # Empty lines are part of the block (track trailing ones separately)
        if [[ -z "${line// /}" ]]; then
          ((++trailing_empty))
          continue
        fi

        # If current indent is greater than base, still in block
        if [[ ${#current_indent} -gt ${#base_indent} ]]; then
          # Non-empty line: any preceding empty lines were interior, not trailing
          block_lines=$((block_lines + trailing_empty + 1))
          trailing_empty=0
          continue
        fi
      fi

      # Block ended - trailing empty lines are excluded from count
      if [[ $block_lines -gt $max_lines ]]; then
        echo -e "${RED}ERROR:${NC} $file:$block_start"
        echo -e "  Inline ${block_type}: block has ${YELLOW}$block_lines lines${NC} (max: $max_lines)"
        echo -e "  Extract to scripts/ directory for maintainability"
        echo ""
        FOUND_ISSUES=1
      fi

      in_block=false
      block_lines=0
      trailing_empty=0
    fi
  done < "$file"

  # Check if file ended while in a block (exclude trailing empty lines)
  if [[ "$in_block" == true ]] && [[ $block_lines -gt $max_lines ]]; then
    echo -e "${RED}ERROR:${NC} $file:$block_start"
    echo -e "  Inline ${block_type}: block has ${YELLOW}$block_lines lines${NC} (max: $max_lines)"
    echo -e "  Extract to scripts/ directory for maintainability"
    echo ""
    FOUND_ISSUES=1
  fi
}

# Main
if [[ $# -eq 0 ]]; then
  # No arguments - check all workflow files
  for file in .github/workflows/*.yml; do
    if [[ -f "$file" ]]; then
      check_file "$file"
    fi
  done
else
  # Check specific files passed as arguments
  for file in "$@"; do
    if [[ -f "$file" ]]; then
      check_file "$file"
    fi
  done
fi

if [[ $FOUND_ISSUES -eq 1 ]]; then
  echo "Workflow script linting failed. Extract long scripts to separate files."
  exit 1
fi

echo "✅ Workflow scripts check passed"

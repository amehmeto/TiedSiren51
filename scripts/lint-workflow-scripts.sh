#!/usr/bin/env bash
# Lint GitHub Actions workflow files for inline scripts
# Fails if any run: block has more than MAX_LINES lines
# Long scripts should be extracted to scripts/ directory

set -euo pipefail

MAX_LINES=3
FOUND_ISSUES=0

# Colors for output
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

check_file() {
  local file="$1"
  local in_run_block=false
  local run_block_start=0
  local run_block_lines=0
  local line_num=0
  local base_indent=""

  while IFS= read -r line || [[ -n "$line" ]]; do
    ((++line_num))

    # Detect start of multi-line run block (run: |)
    if [[ "$line" =~ ^([[:space:]]*)(-[[:space:]]+)?run:[[:space:]]*\|[[:space:]]*$ ]]; then
      in_run_block=true
      run_block_start=$line_num
      run_block_lines=0
      # Capture the indentation level
      base_indent="${BASH_REMATCH[1]}${BASH_REMATCH[2]}"
      continue
    fi

    # If we're in a run block
    if [[ "$in_run_block" == true ]]; then
      # Check if this line is still part of the block (more indented or empty)
      if [[ "$line" =~ ^([[:space:]]*) ]]; then
        current_indent="${BASH_REMATCH[1]}"

        # Empty lines are part of the block
        if [[ -z "${line// /}" ]]; then
          ((++run_block_lines))
          continue
        fi

        # If current indent is greater than base, still in block
        if [[ ${#current_indent} -gt ${#base_indent} ]]; then
          ((++run_block_lines))
          continue
        fi
      fi

      # Block ended - check line count
      if [[ $run_block_lines -gt $MAX_LINES ]]; then
        echo -e "${RED}ERROR:${NC} $file:$run_block_start"
        echo -e "  Inline script has ${YELLOW}$run_block_lines lines${NC} (max: $MAX_LINES)"
        echo -e "  Extract to scripts/ directory for maintainability"
        echo ""
        FOUND_ISSUES=1
      fi

      in_run_block=false
      run_block_lines=0
    fi
  done < "$file"

  # Check if file ended while in a run block
  if [[ "$in_run_block" == true ]] && [[ $run_block_lines -gt $MAX_LINES ]]; then
    echo -e "${RED}ERROR:${NC} $file:$run_block_start"
    echo -e "  Inline script has ${YELLOW}$run_block_lines lines${NC} (max: $MAX_LINES)"
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

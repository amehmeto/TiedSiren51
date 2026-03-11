#!/usr/bin/env bash
set -e

# Shell script linter wrapper
# Usage:
#   ./scripts/lint-sh.sh              Lint all .sh files in standard directories
#   ./scripts/lint-sh.sh file1 file2  Lint specific files (used by lint-staged)
#
# Environment variables:
#   SHELLCHECK_PATH - Path to shellcheck binary (default: auto-detect)

# Find shellcheck binary - prefer system installation to avoid npm download rate limits
find_shellcheck() {
  # 1. Use explicit path if set
  if [[ -n "${SHELLCHECK_PATH:-}" ]] && [[ -x "$SHELLCHECK_PATH" ]]; then
    echo "$SHELLCHECK_PATH"
    return 0
  fi

  # 2. Check common system locations (avoids npm package download)
  local system_paths=("/usr/bin/shellcheck" "/usr/local/bin/shellcheck" "/opt/homebrew/bin/shellcheck")
  for path in "${system_paths[@]}"; do
    if [[ -x "$path" ]]; then
      echo "$path"
      return 0
    fi
  done

  # 3. Fall back to PATH lookup (may trigger npm package download)
  if command -v shellcheck &>/dev/null; then
    command -v shellcheck
    return 0
  fi

  echo "Error: shellcheck not found. Install with: brew install shellcheck (macOS) or apt install shellcheck (Ubuntu)" >&2
  return 1
}

SHELLCHECK_BIN=$(find_shellcheck)

# Require `set -e` near the top of every script (within first 10 lines).
# Excluded: sourced libraries (scripts/lib/) and Claude hooks (.claude/hooks/)
# which manage their own exit codes.
check_set_e() {
  local failed=0
  for file in "$@"; do
    case "$file" in
      */lib/*|.claude/hooks/*) continue ;;
    esac

    if ! head -n 10 "$file" | grep -q 'set -e'; then
      echo "error: $file is missing 'set -e' in the first 10 lines" >&2
      failed=1
    fi
  done
  return $failed
}

if [ $# -gt 0 ]; then
  # Lint specific files passed as arguments (lint-staged mode)
  "$SHELLCHECK_BIN" "$@"
  check_set_e "$@"
else
  # Lint all .sh files in standard directories
  files=()
  while IFS= read -r -d '' f; do
    files+=("$f")
  done < <(find scripts .husky/scripts .claude/hooks .github/scripts -name '*.sh' -print0)

  "$SHELLCHECK_BIN" "${files[@]}"
  check_set_e "${files[@]}"
fi

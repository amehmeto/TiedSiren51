#!/usr/bin/env bash

# Shell script linter wrapper
# Usage:
#   ./scripts/lint-sh.sh              Lint all .sh files in standard directories
#   ./scripts/lint-sh.sh file1 file2  Lint specific files (used by lint-staged)
#
# Environment variables:
#   SHELLCHECK_PATH - Path to shellcheck binary (default: auto-detect)

set -e

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

if [ $# -gt 0 ]; then
  # Lint specific files passed as arguments (lint-staged mode)
  "$SHELLCHECK_BIN" "$@"
else
  # Lint all .sh files in standard directories
  find scripts .husky/scripts .claude/hooks .github/scripts -name '*.sh' -exec "$SHELLCHECK_BIN" {} +
fi

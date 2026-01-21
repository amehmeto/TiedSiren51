#!/usr/bin/env bash

# Shell script linter wrapper
# Usage:
#   ./scripts/lint-sh.sh              Lint all .sh files in standard directories
#   ./scripts/lint-sh.sh file1 file2  Lint specific files (used by lint-staged)

set -e

if [ $# -gt 0 ]; then
  # Lint specific files passed as arguments (lint-staged mode)
  shellcheck "$@"
else
  # Lint all .sh files in standard directories
  find scripts .husky/scripts .claude/hooks .github/scripts -name '*.sh' -exec shellcheck {} +
fi

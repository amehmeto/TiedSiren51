#!/usr/bin/env bash
# Fetch GitHub Project board state as JSON.
# Resolves the repo owner dynamically and queries project #1.
#
# Usage:
#   ./scripts/fetch-project-board.sh          # JSON output
#   ./scripts/fetch-project-board.sh --quiet   # Suppress stderr warnings

set -euo pipefail

QUIET="${1:-}"

OWNER=$(gh repo view --json owner -q '.owner.login' 2>/dev/null) || {
  if [ "$QUIET" != "--quiet" ]; then
    echo "Warning: Could not determine repo owner" >&2
  fi
  echo "[]"
  exit 0
}

gh project item-list 1 --owner "$OWNER" --format json 2>/dev/null || {
  if [ "$QUIET" != "--quiet" ]; then
    echo "Warning: Could not fetch project board for owner '$OWNER'" >&2
  fi
  echo '{"items":[]}'
  exit 0
}

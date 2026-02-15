#!/usr/bin/env bash
set -euo pipefail

# Commit a generated retrospective file to main.
#
# Usage: ./scripts/commit-retro.sh <RETRO_PATH> <PR_NUMBER>

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/lib/colors.sh"

RETRO_PATH="${1:-}"
PR_NUMBER="${2:-}"

if [[ -z "$RETRO_PATH" || -z "$PR_NUMBER" ]]; then
  print_error "Usage: $0 <RETRO_PATH> <PR_NUMBER>"
  exit 1
fi

git config user.name "github-actions[bot]"
git config user.email "github-actions[bot]@users.noreply.github.com"
git add "$RETRO_PATH"
git commit -m "docs(retro): auto-generate retrospective for PR #${PR_NUMBER}"
git push origin main

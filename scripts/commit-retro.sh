#!/usr/bin/env bash
set -euo pipefail

# Commit a generated retrospective file to main.
#
# Usage: ./scripts/commit-retro.sh <RETRO_PATH> <PR_NUMBER>
#
# Includes retry logic to handle concurrent merges pushing to main.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/lib/colors.sh"

RETRO_PATH="${1:-}"
PR_NUMBER="${2:-}"
MAX_RETRIES=3

if [[ -z "$RETRO_PATH" || -z "$PR_NUMBER" ]]; then
  print_error "Usage: $0 <RETRO_PATH> <PR_NUMBER>"
  exit 1
fi

git config user.name "github-actions[bot]"
git config user.email "github-actions[bot]@users.noreply.github.com"
git add "$RETRO_PATH"
git commit -m "docs(retro): auto-generate retrospective for PR #${PR_NUMBER}"

for attempt in $(seq 1 "$MAX_RETRIES"); do
  if git push origin main; then
    print_success "Retrospective committed to main" >&2
    exit 0
  fi
  print_warning "Push failed (attempt $attempt/$MAX_RETRIES), rebasing and retrying..." >&2
  git pull --rebase origin main
done

print_error "Failed to push after $MAX_RETRIES attempts"
exit 1

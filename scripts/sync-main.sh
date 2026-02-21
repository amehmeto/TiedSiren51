#!/usr/bin/env bash
set -euo pipefail

# Sync the current feature branch with origin/main.
# Usage: ./scripts/sync-main.sh
#
# Steps:
#   1. Fetch latest main from origin
#   2. Merge origin/main into the current branch (fast-forward when possible)
#   3. Report result

BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [[ "$BRANCH" == "main" || "$BRANCH" == "master" || "$BRANCH" == "demo" ]]; then
  echo "❌ Refusing to merge main into itself (current branch: $BRANCH)"
  exit 1
fi

echo "⬇️  Fetching origin/main…"
git fetch origin main

BEHIND=$(git rev-list --count HEAD..origin/main)
if [[ "$BEHIND" -eq 0 ]]; then
  echo "✅ Branch '$BRANCH' is already up to date with main."
  exit 0
fi

echo "🔀 Merging origin/main ($BEHIND commit(s) behind)…"
if git merge origin/main --no-edit; then
  echo "✅ Merge complete. Branch '$BRANCH' is now up to date with main."
else
  echo ""
  echo "⚠️  Merge conflicts detected. Resolve them, then run:"
  echo "    git add <resolved-files> && git commit --no-edit"
  exit 1
fi

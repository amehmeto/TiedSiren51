#!/usr/bin/env bash
set -euo pipefail

echo "Checking for conflicts with main..."

if ! git fetch origin main --quiet 2>/dev/null; then
  printf "⚠️  Could not fetch origin/main (network issue?). Skipping conflict check.\n"
  exit 0
fi

merge_tree_output=$(git merge-tree "$(git merge-base HEAD origin/main)" HEAD origin/main)

if echo "$merge_tree_output" | grep -qE '<<<<<<<|=======|>>>>>>>'; then
  printf "❌ Conflicts with main detected. Run: git merge origin/main\n"
  exit 1
fi

printf "✅ No conflicts with main\n"

#!/usr/bin/env bash
set -euo pipefail

git fetch origin main --quiet

merge_tree_output=$(git merge-tree "$(git merge-base HEAD origin/main)" HEAD origin/main)

if echo "$merge_tree_output" | grep -qE '<<<<<<<|=======|>>>>>>>'; then
  printf "❌ Conflicts with main detected. Run: git merge origin/main\n"
  exit 1
fi

printf "✅ No conflicts with main\n"
exit 0

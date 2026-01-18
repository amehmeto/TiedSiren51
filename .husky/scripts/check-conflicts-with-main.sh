#!/usr/bin/env bash
set -euo pipefail

echo "Checking for conflicts with main..."

if ! git fetch origin main --quiet 2>/dev/null; then
  printf "⚠️  Could not fetch origin/main (network issue?). Skipping conflict check.\n"
  exit 0
fi

# Use new git merge-tree syntax (Git 2.38+)
# Exit code 0 = no conflicts, non-zero = conflicts
if ! git merge-tree --write-tree HEAD origin/main >/dev/null 2>&1; then
  printf "❌ Conflicts with main detected. Run: git merge origin/main\n"
  exit 1
fi

printf "✅ No conflicts with main\n"

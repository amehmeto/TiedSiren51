#!/usr/bin/env bash
set -euo pipefail

echo "Checking for conflicts with main..."

# Require Git 2.38+ for --write-tree support
git_version=$(git --version | grep -oE '[0-9]+\.[0-9]+' | head -1)
if [[ "$(printf '%s\n' "2.38" "$git_version" | sort -V | head -1)" != "2.38" ]]; then
  printf "❌ Git 2.38+ required for conflict check (found %s). Upgrade git via your package manager.\n" "$git_version"
  exit 1
fi

if ! git fetch origin main --quiet 2>/dev/null; then
  printf "⚠️  Could not fetch origin/main (network issue?). Skipping conflict check.\n"
  exit 0
fi

# Check if branch is behind main
commits_behind=$(git rev-list --count HEAD..origin/main 2>/dev/null || echo "0")
if [ "$commits_behind" -gt 0 ]; then
  printf "❌ Branch is %s commit(s) behind main. Run: git merge origin/main\n" "$commits_behind"
  exit 1
fi

# Use new git merge-tree syntax (Git 2.38+)
# Exit code 0 = no conflicts, non-zero = conflicts
if ! git merge-tree --write-tree HEAD origin/main >/dev/null 2>&1; then
  printf "❌ Conflicts with main detected. Run: git merge origin/main\n"
  exit 1
fi

printf "✅ No conflicts with main\n"

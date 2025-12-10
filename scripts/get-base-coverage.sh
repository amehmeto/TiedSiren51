#!/usr/bin/env bash
# Get coverage from base branch via git
# Usage: bash scripts/get-base-coverage.sh <base-branch-ref>

BASE_BRANCH=$1

if [ -z "$BASE_BRANCH" ]; then
  echo "Error: Base branch ref is required"
  exit 1
fi

git fetch origin "$BASE_BRANCH"

if git show "origin/$BASE_BRANCH:coverage/coverage-summary.json" > base-coverage.json 2>/dev/null; then
  echo "✅ Base coverage loaded from base branch"
else
  echo "⚠️ No coverage found in base branch, using empty baseline"
  echo '{"total":{"statements":{"pct":0},"functions":{"pct":0},"branches":{"pct":0},"lines":{"pct":0}}}' > base-coverage.json
fi

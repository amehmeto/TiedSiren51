#!/usr/bin/env bash
# Check if coverage cache needs refreshing based on last main branch commit
# Outputs: skip=true if cache is fresh (< 6 days), skip=false otherwise

set -euo pipefail

REPO="${1:?Repository required (owner/repo)}"
GITHUB_OUTPUT="${2:?GITHUB_OUTPUT path required}"

LAST_COMMIT_DATE=$(gh api "repos/$REPO/commits/main" --jq '.commit.committer.date')
DAYS_AGO=$(( ($(date +%s) - $(date -d "$LAST_COMMIT_DATE" +%s)) / 86400 ))

echo "days_since_last_commit=$DAYS_AGO" >> "$GITHUB_OUTPUT"

if [ "$DAYS_AGO" -lt 6 ]; then
  echo "skip=true" >> "$GITHUB_OUTPUT"
  echo "Cache is fresh (last commit $DAYS_AGO days ago), skipping refresh"
else
  echo "skip=false" >> "$GITHUB_OUTPUT"
  echo "Cache may expire soon (last commit $DAYS_AGO days ago), refreshing"
fi

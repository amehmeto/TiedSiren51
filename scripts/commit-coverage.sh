#!/bin/bash
# Commit coverage if changed
# This script commits the coverage summary file if it has changed

set -e

git config --local user.email "github-actions[bot]@users.noreply.github.com"
git config --local user.name "github-actions[bot]"

# For PR events, checkout the actual PR branch (not the merge commit)
if [ -n "$GITHUB_HEAD_REF" ]; then
  echo "Checking out PR branch: $GITHUB_HEAD_REF"
  # Save coverage file
  cp coverage/coverage-summary.json /tmp/coverage-summary.json
  # Checkout PR branch
  git fetch origin "$GITHUB_HEAD_REF"
  git checkout "$GITHUB_HEAD_REF"
  # Restore coverage file
  cp /tmp/coverage-summary.json coverage/coverage-summary.json
fi

# Check if coverage changed
if ! git diff --quiet coverage/coverage-summary.json; then
  git add coverage/coverage-summary.json
  git commit -m "chore: update test coverage summary"
  if [ -n "$GITHUB_HEAD_REF" ]; then
    git push origin "$GITHUB_HEAD_REF"
  else
    git push
  fi
  echo "✅ Coverage updated and committed"
else
  echo "No coverage changes to commit"
fi
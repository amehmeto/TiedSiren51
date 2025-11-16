#!/bin/bash
# Commit coverage if changed
# This script commits the coverage summary file if it has changed

git config --local user.email "github-actions[bot]@users.noreply.github.com"
git config --local user.name "github-actions[bot]"
git add coverage/coverage-summary.json

if ! git diff --staged --quiet; then
  git commit -m "chore: update test coverage summary [skip ci]"
  git push
else
  echo "No coverage changes to commit"
fi
#!/usr/bin/env bash

branch=$(git branch --show-current)

# Skip check on main/demo (handled by no-commits-on-main-demo.sh)
if [ "$branch" = "main" ] || [ "$branch" = "demo" ]; then
  exit 0
fi

# Check if a PR for this branch was already merged
pr_state=$(gh pr view "$branch" --json state --jq '.state' 2>/dev/null)

if [ "$pr_state" = "MERGED" ]; then
  printf "\033[0;35mError: Branch '%s' has already been merged into main.\033[0m\n" "$branch"
  printf "\033[0;35mCreate a new branch before committing.\033[0m\n"
  exit 1
fi

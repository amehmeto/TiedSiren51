#!/usr/bin/env bash
set -euo pipefail

# Update PR Description Script
# Automatically updates the PR description based on commits in the branch
# Called after CI passes to keep PR description in sync with changes
#
# Environment variables:
#   SKIP_PR_UPDATE - Set to any non-empty value to skip PR update

# Source shared colors
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/lib/colors.sh"

# Allow skipping PR update
if [[ -n "${SKIP_PR_UPDATE:-}" ]]; then
  print_info "SKIP_PR_UPDATE is set, skipping PR description update"
  exit 0
fi

# Check for required dependencies
if ! command -v gh &>/dev/null; then
  print_warning "GitHub CLI (gh) not found, skipping PR update"
  exit 0
fi

# Get current branch
branch=$(git rev-parse --abbrev-ref HEAD)

# Skip if on main/master
if [[ "$branch" == "main" || "$branch" == "master" ]]; then
  exit 0
fi

# Check if there's an open PR for this branch
pr_number=$(gh pr view "$branch" --json number --jq '.number' 2>/dev/null || echo "")

if [[ -z "$pr_number" ]]; then
  print_info "No open PR for branch '$branch', skipping description update"
  exit 0
fi

print_info "Updating PR #$pr_number description..."

# Get the base branch for this PR
base_branch=$(gh pr view "$pr_number" --json baseRefName --jq '.baseRefName')

# Generate summary from commits
commits=$(git log "$base_branch..HEAD" --pretty=format:"- %s" --reverse)
commit_count=$(git rev-list --count "$base_branch..HEAD")

# Get linked issues from branch name (e.g., fix/TS248-description -> #248)
issue_number=""
if [[ "$branch" =~ TS([0-9]+) ]]; then
  issue_number="${BASH_REMATCH[1]}"
fi

# Build the PR body
body="## Summary
$commits

## Changes
- $commit_count commit(s) in this PR

## Test plan
- [ ] Verified changes work as expected
- [ ] Tests pass locally
"

# Add closes line if we found an issue number
if [[ -n "$issue_number" ]]; then
  body+="
Closes #$issue_number
"
fi

body+="
---
*This description was auto-generated from commit messages.*
"

# Update the PR
if gh pr edit "$pr_number" --body "$body" >/dev/null 2>&1; then
  print_success "PR #$pr_number description updated"
else
  print_warning "Failed to update PR description (non-fatal)"
fi

exit 0

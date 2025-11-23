#!/usr/bin/env bash
set -e

# Script to cleanup GitHub Releases created for PR builds
# Usage: ./cleanup-pr-releases.sh <github_context_json>

GITHUB_CONTEXT="$1"

if [ -z "$GITHUB_CONTEXT" ]; then
  echo "Error: Missing required argument"
  echo "Usage: $0 <github_context_json>"
  exit 1
fi

# Extract values from GitHub context JSON
PR_NUMBER=$(echo "$GITHUB_CONTEXT" | jq -r '.event.pull_request.number')
REPOSITORY=$(echo "$GITHUB_CONTEXT" | jq -r '.repository')

echo "Cleaning up releases for PR #${PR_NUMBER}"

# List all releases matching the PR pattern
RELEASES=$(gh release list --repo "$REPOSITORY" --limit 1000 | grep "pr-${PR_NUMBER}-build-" | awk '{print $3}' || true)

if [ -z "$RELEASES" ]; then
  echo "No releases found for PR #${PR_NUMBER}"
  exit 0
fi

# Delete each release
echo "$RELEASES" | while read -r TAG; do
  if [ -n "$TAG" ]; then
    echo "Deleting release: $TAG"
    gh release delete "$TAG" --repo "$REPOSITORY" --yes || true
  fi
done

echo "Cleanup complete for PR #${PR_NUMBER}"

#!/usr/bin/env bash
set -e

# Script to create a GitHub Release with APK for PR builds
# Usage: ./create-release-with-apk.sh <github_context_json> <apk_path>

GITHUB_CONTEXT="$1"
APK_PATH="$2"

if [ -z "$GITHUB_CONTEXT" ] || [ -z "$APK_PATH" ]; then
  echo "Error: Missing required arguments"
  echo "Usage: $0 <github_context_json> <apk_path>"
  exit 1
fi

# Extract values from GitHub context JSON
PR_NUMBER=$(echo "$GITHUB_CONTEXT" | jq -r '.event.pull_request.number')
RUN_NUMBER=$(echo "$GITHUB_CONTEXT" | jq -r '.run_number')
PR_TITLE=$(echo "$GITHUB_CONTEXT" | jq -r '.event.pull_request.title')
BRANCH=$(echo "$GITHUB_CONTEXT" | jq -r '.head_ref')
AUTHOR=$(echo "$GITHUB_CONTEXT" | jq -r '.event.pull_request.user.login')
COMMIT_SHA=$(echo "$GITHUB_CONTEXT" | jq -r '.event.pull_request.head.sha')
PR_URL=$(echo "$GITHUB_CONTEXT" | jq -r '.event.pull_request.html_url')
REPOSITORY=$(echo "$GITHUB_CONTEXT" | jq -r '.repository')

TAG_NAME="pr-${PR_NUMBER}-build-${RUN_NUMBER}"
RELEASE_TITLE="PR #${PR_NUMBER} - Build #${RUN_NUMBER}"
APK_NAME=$(basename "$APK_PATH")

# Create release and upload APK
gh release create "$TAG_NAME" \
  "$APK_PATH" \
  --title "$RELEASE_TITLE" \
  --notes "Android APK build for PR #${PR_NUMBER}

**Branch:** \`${BRANCH}\`
**Author:** @${AUTHOR}
**Commit:** ${COMMIT_SHA}

[View Pull Request](${PR_URL})" \
  --prerelease \
  --repo "$REPOSITORY"

# Generate download URL
DOWNLOAD_URL="https://github.com/${REPOSITORY}/releases/download/${TAG_NAME}/${APK_NAME}"

# Output for GitHub Actions
echo "download_url=${DOWNLOAD_URL}" >> "$GITHUB_OUTPUT"
echo "tag_name=${TAG_NAME}" >> "$GITHUB_OUTPUT"
echo "APK available at: ${DOWNLOAD_URL}"

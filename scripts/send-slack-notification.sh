#!/usr/bin/env bash
set -e

# Script to send Slack notification for APK build
# Usage: ./send-slack-notification.sh <github_context_json> <steps_context_json>

GITHUB_CONTEXT="$1"
STEPS_CONTEXT="$2"

if [ -z "$GITHUB_CONTEXT" ] || [ -z "$STEPS_CONTEXT" ]; then
  echo "Error: Missing required arguments"
  echo "Usage: $0 <github_context_json> <steps_context_json>"
  exit 1
fi

if [ -z "$SLACK_WEBHOOK_URL" ]; then
  echo "Error: SLACK_WEBHOOK_URL environment variable not set"
  exit 1
fi

# Extract values from GitHub context JSON
PR_NUMBER=$(echo "$GITHUB_CONTEXT" | jq -r '.event.pull_request.number')
PR_TITLE=$(echo "$GITHUB_CONTEXT" | jq -r '.event.pull_request.title')
PR_URL=$(echo "$GITHUB_CONTEXT" | jq -r '.event.pull_request.html_url')
BRANCH=$(echo "$GITHUB_CONTEXT" | jq -r '.head_ref')
RUN_NUMBER=$(echo "$GITHUB_CONTEXT" | jq -r '.run_number')
AUTHOR=$(echo "$GITHUB_CONTEXT" | jq -r '.event.pull_request.user.login')
COMMIT_SHA=$(echo "$GITHUB_CONTEXT" | jq -r '.event.pull_request.head.sha')
COMMIT_URL=$(echo "$GITHUB_CONTEXT" | jq -r '.event.pull_request.head.repo.html_url')
SERVER_URL=$(echo "$GITHUB_CONTEXT" | jq -r '.server_url')
REPOSITORY=$(echo "$GITHUB_CONTEXT" | jq -r '.repository')

# Extract values from steps context JSON
APK_NAME=$(echo "$STEPS_CONTEXT" | jq -r '.find_apk.outputs.apk_name')
DOWNLOAD_URL=$(echo "$STEPS_CONTEXT" | jq -r '.create_release.outputs.download_url')
TAG_NAME=$(echo "$STEPS_CONTEXT" | jq -r '.create_release.outputs.tag_name')

RELEASE_URL="${SERVER_URL}/${REPOSITORY}/releases/tag/${TAG_NAME}"

# Generate Slack payload
PAYLOAD=$(cat <<EOF
{
  "text": "📱 New Android APK ready for QA testing!",
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "🎉 Android Build Ready for QA"
      }
    },
    {
      "type": "section",
      "fields": [
        {
          "type": "mrkdwn",
          "text": "*PR:*\n<${PR_URL}|#${PR_NUMBER} - ${PR_TITLE}>"
        },
        {
          "type": "mrkdwn",
          "text": "*Branch:*\n\`${BRANCH}\`"
        },
        {
          "type": "mrkdwn",
          "text": "*Build:*\n#${RUN_NUMBER}"
        },
        {
          "type": "mrkdwn",
          "text": "*Author:*\n${AUTHOR}"
        }
      ]
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*APK File:* \`${APK_NAME}\`"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Commit:*\n<${COMMIT_URL}/commit/${COMMIT_SHA}|${COMMIT_SHA}>"
      }
    },
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "⬇️ Download APK",
            "emoji": true
          },
          "url": "${DOWNLOAD_URL}",
          "style": "primary"
        },
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "📋 View PR",
            "emoji": true
          },
          "url": "${PR_URL}"
        },
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "🏷️ View Release",
            "emoji": true
          },
          "url": "${RELEASE_URL}"
        }
      ]
    }
  ]
}
EOF
)

# Send to Slack
curl -X POST \
  -H 'Content-type: application/json' \
  --data "$PAYLOAD" \
  "$SLACK_WEBHOOK_URL"

echo "Slack notification sent successfully"

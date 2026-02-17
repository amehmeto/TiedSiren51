#!/usr/bin/env bash
set -euo pipefail

# Send a Slack notification to #qa channel when an APK build is ready.
# Includes PR metadata, download link, and test plan extracted from the linked issue.
#
# Usage: ./scripts/send-slack-notification.sh <github_context_json> <steps_context_json>
#
# Env: SLACK_QA_WEBHOOK_URL (required) - Slack incoming webhook for #qa channel
#      GH_TOKEN (required) - GitHub token for issue body retrieval

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/lib/colors.sh"

GITHUB_CONTEXT="${1:-}"
STEPS_CONTEXT="${2:-}"

if [[ -z "$GITHUB_CONTEXT" || -z "$STEPS_CONTEXT" ]]; then
  print_error "Missing required arguments"
  echo "Usage: $0 <github_context_json> <steps_context_json>" >&2
  exit 1
fi

if [[ -z "${SLACK_QA_WEBHOOK_URL:-}" ]]; then
  print_error "SLACK_QA_WEBHOOK_URL environment variable not set"
  exit 1
fi

# Extract values from GitHub context
PR_NUMBER=$(echo "$GITHUB_CONTEXT" | jq -r '.event.pull_request.number')
PR_TITLE=$(echo "$GITHUB_CONTEXT" | jq -r '.event.pull_request.title')
PR_URL=$(echo "$GITHUB_CONTEXT" | jq -r '.event.pull_request.html_url')
BRANCH=$(echo "$GITHUB_CONTEXT" | jq -r '.head_ref')
RUN_NUMBER=$(echo "$GITHUB_CONTEXT" | jq -r '.run_number')
AUTHOR=$(echo "$GITHUB_CONTEXT" | jq -r '.event.pull_request.user.login')
COMMIT_SHA=$(echo "$GITHUB_CONTEXT" | jq -r '.event.pull_request.head.sha')
SHORT_SHA="${COMMIT_SHA:0:7}"
SERVER_URL=$(echo "$GITHUB_CONTEXT" | jq -r '.server_url')
REPOSITORY=$(echo "$GITHUB_CONTEXT" | jq -r '.repository')

# Extract values from steps context
DOWNLOAD_URL=$(echo "$STEPS_CONTEXT" | jq -r '.create_release.outputs.download_url')
TAG_NAME=$(echo "$STEPS_CONTEXT" | jq -r '.create_release.outputs.tag_name')
RELEASE_URL="${SERVER_URL}/${REPOSITORY}/releases/tag/${TAG_NAME}"

# Extract issue number from branch name (e.g., feat/TS300-description -> 300)
ISSUE_NUMBER=""
if [[ "$BRANCH" =~ TS([0-9]+) ]]; then
  ISSUE_NUMBER="${BASH_REMATCH[1]}"
fi

# Extract test plan from linked issue
TEST_PLAN=""
ISSUE_URL=""
if [[ -n "$ISSUE_NUMBER" ]]; then
  ISSUE_URL="${SERVER_URL}/${REPOSITORY}/issues/${ISSUE_NUMBER}"
  TEST_PLAN=$("$SCRIPT_DIR/extract-test-plan.sh" "$ISSUE_NUMBER" 2>/dev/null) || TEST_PLAN=""
fi

# Build test plan blocks (conditionally included)
TEST_PLAN_BLOCKS="[]"
if [[ -n "$TEST_PLAN" ]]; then
  TEST_PLAN_HEADER="Test Plan"
  if [[ -n "$ISSUE_NUMBER" ]]; then
    TEST_PLAN_HEADER="Test Plan (from <${ISSUE_URL}|#${ISSUE_NUMBER}>)"
  fi
  TEST_PLAN_BLOCKS=$(jq -n \
    --arg header "$TEST_PLAN_HEADER" \
    --arg plan "$TEST_PLAN" \
    '[
      { type: "divider" },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: ("*" + $header + "*\n\n" + $plan)
        }
      }
    ]')
fi

# Build action buttons
ACTION_BUTTONS=$(jq -n \
  --arg download_url "$DOWNLOAD_URL" \
  --arg pr_url "$PR_URL" \
  --arg release_url "$RELEASE_URL" \
  '[
    {
      type: "button",
      text: { type: "plain_text", text: "Download APK", emoji: true },
      url: $download_url,
      style: "primary"
    },
    {
      type: "button",
      text: { type: "plain_text", text: "View PR", emoji: true },
      url: $pr_url
    },
    {
      type: "button",
      text: { type: "plain_text", text: "View Release", emoji: true },
      url: $release_url
    }
  ]')

# Add issue button if issue is linked
if [[ -n "$ISSUE_URL" ]]; then
  ACTION_BUTTONS=$(echo "$ACTION_BUTTONS" | jq --arg url "$ISSUE_URL" '. + [{
    type: "button",
    text: { type: "plain_text", text: "View Issue", emoji: true },
    url: $url
  }]')
fi

# Build full Slack payload
PAYLOAD=$(jq -n \
  --arg pr_number "$PR_NUMBER" \
  --arg pr_title "$PR_TITLE" \
  --arg pr_url "$PR_URL" \
  --arg branch "$BRANCH" \
  --arg run_number "$RUN_NUMBER" \
  --arg author "$AUTHOR" \
  --arg short_sha "$SHORT_SHA" \
  --argjson test_plan_blocks "$TEST_PLAN_BLOCKS" \
  --argjson action_buttons "$ACTION_BUTTONS" \
  '{
    text: ("New Android APK for PR #" + $pr_number + " ready for QA"),
    blocks: ([
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "Android Build Ready for QA",
          emoji: true
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: ("*PR:*\n<" + $pr_url + "|#" + $pr_number + " — " + $pr_title + ">")
          },
          {
            type: "mrkdwn",
            text: ("*Author:*\n" + $author)
          },
          {
            type: "mrkdwn",
            text: ("*Branch:*\n`" + $branch + "`")
          },
          {
            type: "mrkdwn",
            text: ("*Build:*\n#" + $run_number + " (" + $short_sha + ")")
          }
        ]
      }
    ] + $test_plan_blocks + [
      {
        type: "actions",
        elements: $action_buttons
      }
    ])
  }')

# Send to Slack
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST \
  -H 'Content-type: application/json' \
  --data "$PAYLOAD" \
  "$SLACK_QA_WEBHOOK_URL")

if [[ "$HTTP_CODE" == "200" ]]; then
  print_success "QA notification sent to Slack #qa channel" >&2
else
  print_error "Slack webhook returned HTTP $HTTP_CODE" >&2
  exit 1
fi

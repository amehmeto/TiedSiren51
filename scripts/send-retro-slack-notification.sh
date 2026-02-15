#!/usr/bin/env bash
set -euo pipefail

# Send a review retrospective summary to Slack #retro channel.
#
# Usage: ./scripts/send-retro-slack-notification.sh <retro_summary_json>
#
# Input: JSON from generate-retro.sh stdout, e.g.:
#   { "pr_number": "283", "pr_title": "...", "pr_url": "...",
#     "retro_path": "docs/retrospective/...", "retro_filename": "...",
#     "rounds": 3, "threads": 13, "top_category": "Naming/Style",
#     "is_minimal": false }
#
# Env: SLACK_RETRO_WEBHOOK_URL (required)
#      GITHUB_SERVER_URL, GITHUB_REPOSITORY (optional, for file link)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/lib/colors.sh"

RETRO_JSON="${1:-}"
if [[ -z "$RETRO_JSON" ]]; then
  print_error "Retro summary JSON is required"
  echo "Usage: $0 '<retro_summary_json>'" >&2
  exit 1
fi

if [[ -z "${SLACK_RETRO_WEBHOOK_URL:-}" ]]; then
  print_error "SLACK_RETRO_WEBHOOK_URL environment variable is required"
  exit 1
fi

# Extract fields from JSON
PR_NUMBER=$(echo "$RETRO_JSON" | jq -r '.pr_number')
PR_TITLE=$(echo "$RETRO_JSON" | jq -r '.pr_title')
PR_URL=$(echo "$RETRO_JSON" | jq -r '.pr_url')
RETRO_PATH=$(echo "$RETRO_JSON" | jq -r '.retro_path')
ROUNDS=$(echo "$RETRO_JSON" | jq -r '.rounds')
THREADS=$(echo "$RETRO_JSON" | jq -r '.threads')
TOP_CATEGORY=$(echo "$RETRO_JSON" | jq -r '.top_category')
IS_MINIMAL=$(echo "$RETRO_JSON" | jq -r '.is_minimal')

# Build link to retro file in the repo
SERVER_URL="${GITHUB_SERVER_URL:-https://github.com}"
REPOSITORY="${GITHUB_REPOSITORY:-amehmeto/TiedSiren51}"
RETRO_FILE_URL="${SERVER_URL}/${REPOSITORY}/blob/main/${RETRO_PATH}"

# Skip Slack for minimal retros
if [[ "$IS_MINIMAL" == "true" ]]; then
  print_info "Minimal review activity — skipping Slack notification" >&2
  exit 0
fi

# Build Slack payload
PAYLOAD=$(jq -n \
  --arg pr_number "$PR_NUMBER" \
  --arg pr_title "$PR_TITLE" \
  --arg pr_url "$PR_URL" \
  --arg retro_url "$RETRO_FILE_URL" \
  --arg rounds "$ROUNDS" \
  --arg threads "$THREADS" \
  --arg top_category "$TOP_CATEGORY" \
  '{
    text: "Review retrospective for PR #\($pr_number)",
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "Review Retrospective",
          emoji: true
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*PR:*\n<\($pr_url)|#\($pr_number) — \($pr_title)>"
          },
          {
            type: "mrkdwn",
            text: "*Review Rounds:*\n\($rounds)"
          },
          {
            type: "mrkdwn",
            text: "*Threads:*\n\($threads)"
          },
          {
            type: "mrkdwn",
            text: "*Top Category:*\n\($top_category)"
          }
        ]
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "View Full Retrospective",
              emoji: true
            },
            url: $retro_url,
            style: "primary"
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "View PR",
              emoji: true
            },
            url: $pr_url
          }
        ]
      }
    ]
  }')

# Send to Slack
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST \
  -H 'Content-type: application/json' \
  --data "$PAYLOAD" \
  "$SLACK_RETRO_WEBHOOK_URL")

if [[ "$HTTP_CODE" == "200" ]]; then
  print_success "Retro notification sent to Slack #retro channel" >&2
else
  print_error "Slack webhook returned HTTP $HTTP_CODE" >&2
  exit 1
fi

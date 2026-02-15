#!/usr/bin/env bash
set -euo pipefail

# Send a review retrospective summary to Slack #retro channel.
#
# Usage: ./scripts/send-retro-slack-notification.sh <retro_md_path> <pr_number>
#
# Input: Path to the generated retro markdown file and the PR number.
#        Extracts stats (rounds, threads, top category) from the markdown content.
#
# Env: SLACK_RETRO_WEBHOOK_URL (required)
#      GITHUB_SERVER_URL, GITHUB_REPOSITORY (optional, for file link)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/lib/colors.sh"

RETRO_PATH="${1:-}"
PR_NUMBER="${2:-}"

if [[ -z "$RETRO_PATH" || ! -f "$RETRO_PATH" ]]; then
  print_error "Retro markdown file is required and must exist"
  echo "Usage: $0 <retro_md_path> <pr_number>" >&2
  exit 1
fi

if [[ -z "$PR_NUMBER" ]]; then
  print_error "PR number is required"
  echo "Usage: $0 <retro_md_path> <pr_number>" >&2
  exit 1
fi

if [[ -z "${SLACK_RETRO_WEBHOOK_URL:-}" ]]; then
  print_error "SLACK_RETRO_WEBHOOK_URL environment variable is required"
  exit 1
fi

# Extract PR title from the retro file header (# PR #NNN Review Retrospective — TITLE)
PR_TITLE=$(head -1 "$RETRO_PATH" | sed 's/^# PR #[0-9]* Review Retrospective — //')

# Extract stats from the retro markdown (best-effort, falls back to defaults)
ROUNDS=$(grep -c '| \*\*R' "$RETRO_PATH" 2>/dev/null || echo "0")
THREADS=$(grep -oE '[0-9]+ threads' "$RETRO_PATH" | head -1 | grep -oE '[0-9]+' || echo "0")
# Extract top category from Root Cause Classification table (first data row, second column)
TOP_CATEGORY=$(awk '/^## Root Cause Classification/,/^## [^R]/{if(/\|-------/){getline; split($0, a, "|"); gsub(/^ +| +$/, "", a[2]); gsub(/\*/, "", a[2]); print a[2]; exit}}' "$RETRO_PATH" || echo "Unknown")
TOP_CATEGORY="${TOP_CATEGORY:-Unknown}"

# Build links
SERVER_URL="${GITHUB_SERVER_URL:-https://github.com}"
REPOSITORY="${GITHUB_REPOSITORY:-amehmeto/TiedSiren51}"
PR_URL="${SERVER_URL}/${REPOSITORY}/pull/${PR_NUMBER}"
RETRO_FILE_URL="${SERVER_URL}/${REPOSITORY}/blob/main/${RETRO_PATH}"

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

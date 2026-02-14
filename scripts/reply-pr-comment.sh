#!/usr/bin/env bash
# Reply to a PR review comment thread.
# Usage: ./scripts/reply-pr-comment.sh <pr-number> <in-reply-to-comment-id> <body>
#
# Only supports replying in-thread to existing PR review comments (POST to
# /repos/:owner/:repo/pulls/:pr/comments with in_reply_to).

set -euo pipefail

if [[ $# -lt 3 ]]; then
  echo "Usage: $0 <pr-number> <in-reply-to-comment-id> <body>" >&2
  exit 1
fi

PR_NUMBER="$1"
IN_REPLY_TO="$2"
BODY="$3"

REPO=$(gh repo view --json nameWithOwner -q '.nameWithOwner')
COMMIT_ID=$(git rev-parse HEAD)

# Fetch the original comment to get path and line for the reply
ORIGINAL=$(gh api "repos/${REPO}/pulls/comments/${IN_REPLY_TO}" --jq '{path: .path, line: (.line // .original_line)}')
PATH_VAL=$(echo "$ORIGINAL" | jq -r '.path')
LINE_VAL=$(echo "$ORIGINAL" | jq -r '.line')

gh api "repos/${REPO}/pulls/${PR_NUMBER}/comments" \
  -F body="${BODY}" \
  -F commit_id="${COMMIT_ID}" \
  -F path="${PATH_VAL}" \
  -F line="${LINE_VAL}" \
  -F in_reply_to="${IN_REPLY_TO}" \
  --jq '.html_url'

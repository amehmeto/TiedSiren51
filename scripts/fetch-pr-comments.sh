#!/usr/bin/env bash
set -euo pipefail

# Fetch PR Comments Script
# Fetches all comments from a GitHub PR (issue comments, review comments, reviews)
# and outputs them as structured JSON to stdout.
#
# Usage: ./scripts/fetch-pr-comments.sh <PR_NUMBER> [--owner-only]
#
# Options:
#   --owner-only  Filter to only show comments from the repo owner
#
# Output: JSON object with arrays: issue_comments, reviews, review_comment_threads
#   review_comments are grouped into threads via in_reply_to_id
#   each thread includes an is_resolved field from the GraphQL API

# Source shared colors
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/lib/colors.sh"

# Check for required dependencies
if ! command -v gh &>/dev/null; then
  print_error "GitHub CLI (gh) is required but not installed"
  exit 1
fi

if ! command -v jq &>/dev/null; then
  print_error "jq is required but not installed"
  exit 1
fi

# Parse arguments
PR_NUMBER=""
OWNER_ONLY=false

for arg in "$@"; do
  if [[ "$arg" == "--owner-only" ]]; then
    OWNER_ONLY=true
  elif [[ -z "$PR_NUMBER" && "$arg" =~ ^[0-9]+$ ]]; then
    PR_NUMBER="$arg"
  else
    print_error "Unknown argument: $arg"
    echo "Usage: $0 <PR_NUMBER> [--owner-only]" >&2
    exit 1
  fi
done

if [[ -z "$PR_NUMBER" ]]; then
  print_error "PR number is required"
  echo "Usage: $0 <PR_NUMBER> [--owner-only]" >&2
  exit 1
fi

# Detect repo info
REPO_INFO=$(gh repo view --json nameWithOwner,owner)
REPO_NWO=$(echo "$REPO_INFO" | jq -r '.nameWithOwner')
OWNER=$(echo "$REPO_INFO" | jq -r '.owner.login')
REPO_OWNER=$(echo "$REPO_NWO" | cut -d'/' -f1)
REPO_NAME=$(echo "$REPO_NWO" | cut -d'/' -f2)

print_info "Fetching comments for PR #$PR_NUMBER in $REPO_NWO..." >&2

# Fetch REST endpoints (issue comments, review comments, reviews)
issue_comments_raw=$(gh api --paginate "repos/$REPO_NWO/issues/$PR_NUMBER/comments")
review_comments_raw=$(gh api --paginate "repos/$REPO_NWO/pulls/$PR_NUMBER/comments")
reviews_raw=$(gh api --paginate "repos/$REPO_NWO/pulls/$PR_NUMBER/reviews")

# Fetch resolved status for review threads via GraphQL
# Maps each thread's root comment databaseId to its isResolved boolean
# shellcheck disable=SC2016  # GraphQL variables use $-syntax, not shell expansion
GRAPHQL_QUERY='
query($owner: String!, $repo: String!, $number: Int!, $cursor: String) {
  repository(owner: $owner, name: $repo) {
    pullRequest(number: $number) {
      reviewThreads(first: 100, after: $cursor) {
        pageInfo { hasNextPage endCursor }
        nodes {
          isResolved
          comments(first: 1) {
            nodes { databaseId }
          }
        }
      }
    }
  }
}'

# Paginate GraphQL manually (gh api --paginate only works for REST)
resolved_map='{}' cursor=""
while true; do
  cursor_arg=()
  if [[ -n "$cursor" ]]; then
    cursor_arg=(-f "cursor=$cursor")
  fi

  graphql_result=$(gh api graphql \
    -f query="$GRAPHQL_QUERY" \
    -f owner="$REPO_OWNER" \
    -f repo="$REPO_NAME" \
    -F number="$PR_NUMBER" \
    ${cursor_arg[@]+"${cursor_arg[@]}"})

  # Extract thread resolved map: { "<databaseId>": true/false, ... }
  page_map=$(echo "$graphql_result" | jq '
    .data.repository.pullRequest.reviewThreads.nodes
    | map(select(.comments.nodes | length > 0))
    | map({ key: (.comments.nodes[0].databaseId | tostring), value: .isResolved })
    | from_entries
  ')
  resolved_map=$(echo "$resolved_map" "$page_map" | jq -s '.[0] * .[1]')

  has_next=$(echo "$graphql_result" | jq -r '.data.repository.pullRequest.reviewThreads.pageInfo.hasNextPage')
  if [[ "$has_next" != "true" ]]; then
    break
  fi
  cursor=$(echo "$graphql_result" | jq -r '.data.repository.pullRequest.reviewThreads.pageInfo.endCursor')
done

print_info "Fetched resolved status for $(echo "$resolved_map" | jq 'length') review threads" >&2

# Transform issue comments
issue_comments=$(echo "$issue_comments_raw" | jq '[.[] | {
  id: .id,
  user: .user.login,
  body: .body,
  created_at: .created_at,
  updated_at: .updated_at,
  html_url: .html_url
}]')

# Transform reviews
reviews=$(echo "$reviews_raw" | jq '[.[] | {
  id: .id,
  user: .user.login,
  state: .state,
  body: .body,
  submitted_at: .submitted_at,
  html_url: .html_url
}]')

# Transform review comments (file/line-level)
# position null means the comment is outdated (code has changed since)
review_comments=$(echo "$review_comments_raw" | jq '[.[] | {
  id: .id,
  user: .user.login,
  body: .body,
  path: .path,
  line: .line,
  original_line: .original_line,
  diff_hunk: .diff_hunk,
  in_reply_to_id: .in_reply_to_id,
  created_at: .created_at,
  updated_at: .updated_at,
  html_url: .html_url,
  outdated: (.position == null)
}]')

# Apply owner-only filter if requested
if [[ "$OWNER_ONLY" == true ]]; then
  print_info "Filtering to owner comments only ($OWNER)..." >&2
  issue_comments=$(echo "$issue_comments" | jq --arg owner "$OWNER" '[.[] | select(.user == $owner)]')
  reviews=$(echo "$reviews" | jq --arg owner "$OWNER" '[.[] | select(.user == $owner)]')
  review_comments=$(echo "$review_comments" | jq --arg owner "$OWNER" '[.[] | select(.user == $owner)]')
fi

# Group review comments into threads using in_reply_to_id
# Thread roots are comments without in_reply_to_id
# Replies are grouped under their root
# Merge is_resolved from GraphQL resolved_map
review_comment_threads=$(jq -n \
  --argjson comments "$review_comments" \
  --argjson resolved "$resolved_map" \
  '$comments
  | group_by(.in_reply_to_id // .id)
  | map({
      thread_id: (.[0].in_reply_to_id // .[0].id),
      is_resolved: ($resolved[(.[0].in_reply_to_id // .[0].id) | tostring] // false),
      comments: .
    })
')

# Build final output (include repo metadata for downstream consumers)
jq -n \
  --arg repo_nwo "$REPO_NWO" \
  --arg owner "$OWNER" \
  --argjson issue_comments "$issue_comments" \
  --argjson reviews "$reviews" \
  --argjson review_comment_threads "$review_comment_threads" \
  '{
    repo: $repo_nwo,
    owner: $owner,
    issue_comments: $issue_comments,
    reviews: $reviews,
    review_comment_threads: $review_comment_threads
  }'

issue_count=$(echo "$issue_comments" | jq 'length')
review_count=$(echo "$reviews" | jq 'length')
thread_count=$(echo "$review_comment_threads" | jq 'length')
resolved_count=$(echo "$review_comment_threads" | jq '[.[] | select(.is_resolved)] | length')
unresolved_count=$(echo "$review_comment_threads" | jq '[.[] | select(.is_resolved | not)] | length')
print_success "Fetched $issue_count issue comments, $review_count reviews, $thread_count threads ($resolved_count resolved, $unresolved_count unresolved)" >&2

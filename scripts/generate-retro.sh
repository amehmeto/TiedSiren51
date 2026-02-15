#!/usr/bin/env bash
set -euo pipefail

# Generate a review retrospective for a merged PR.
#
# Usage: ./scripts/generate-retro.sh <PR_NUMBER>
#
# This script:
# 1. Fetches PR comments and metadata
# 2. Builds a structured prompt for Claude
# 3. Calls Claude API to generate the retrospective
# 4. Writes the result to docs/retrospective/PR-{number}-{short-desc}-review-retro.md
# 5. Outputs a JSON summary to stdout for downstream consumers (Slack, etc.)
#
# Requires: gh, jq, curl
# Env: ANTHROPIC_API_KEY (required)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/lib/colors.sh"

# --- Argument parsing ---
PR_NUMBER="${1:-}"
if [[ -z "$PR_NUMBER" ]]; then
  print_error "PR number is required"
  echo "Usage: $0 <PR_NUMBER>" >&2
  exit 1
fi

if [[ -z "${ANTHROPIC_API_KEY:-}" ]]; then
  print_error "ANTHROPIC_API_KEY environment variable is required"
  exit 1
fi

# --- Fetch PR data ---
print_info "Fetching PR #$PR_NUMBER metadata..." >&2

PR_META=$(gh pr view "$PR_NUMBER" --json title,body,commits,createdAt,updatedAt,mergedAt,reviews,comments,number,url,headRefName,baseRefName)
PR_TITLE=$(echo "$PR_META" | jq -r '.title')
PR_URL=$(echo "$PR_META" | jq -r '.url')
# Derive short description for filename (kebab-case, max 5 words from title)
SHORT_DESC=$(echo "$PR_TITLE" \
  | sed 's/^[a-z]*([^)]*): //' \
  | tr '[:upper:]' '[:lower:]' \
  | tr -cs '[:alnum:]' '-' \
  | sed 's/^-//;s/-$//' \
  | cut -d'-' -f1-5)

RETRO_FILENAME="PR-${PR_NUMBER}-${SHORT_DESC}-review-retro.md"
RETRO_PATH="docs/retrospective/${RETRO_FILENAME}"

print_info "Will write retrospective to: $RETRO_PATH" >&2

# --- Fetch PR comments ---
print_info "Fetching PR comments..." >&2
PR_COMMENTS=$("$SCRIPT_DIR/fetch-pr-comments.sh" "$PR_NUMBER" 2>/dev/null)

# --- Fetch commit history ---
print_info "Fetching commit history..." >&2
COMMIT_LOG=$(echo "$PR_META" | jq -r '.commits[] | "\(.oid | .[0:7]) \(.messageHeadline) (\(.committedDate))"')

# --- Build the prompt ---
# Read the review-retro command template for format guidance
RETRO_TEMPLATE=""
if [[ -f "$SCRIPT_DIR/../.claude/commands/review-retro.md" ]]; then
  RETRO_TEMPLATE=$(cat "$SCRIPT_DIR/../.claude/commands/review-retro.md")
fi

# Read existing retrospectives as examples
EXAMPLE_RETRO=""
for example in "$SCRIPT_DIR/../docs/retrospective/"*.md; do
  if [[ -f "$example" ]]; then
    EXAMPLE_RETRO+="--- Example: $(basename "$example") ---
$(cat "$example")

"
  fi
done

PROMPT=$(cat <<'PROMPT_END'
You are a code review analyst. Generate a structured review retrospective for a merged PR.

## Instructions

Analyze the PR conversation below and produce a retrospective markdown file following the EXACT format of the example retrospectives provided. The retrospective must include:

1. **Timeline** — A table showing review rounds (a round = reviewer comments -> author fixes -> re-review). Include dates, comment counts per round, and fix commits.

2. **Root Cause Classification** — Classify EVERY review comment into one of these categories:
   - Architecture/Design
   - Naming/Style
   - Logic/Bug
   - Testing
   - Over-engineering
   - Under-engineering
   - Misunderstanding
   - Tooling/Config
   - Nit
   Show counts and percentages per category.

3. **Repeat Offenders** — Identify patterns that caused multiple rounds (same file reviewed repeatedly, same type of feedback recurring, fixes that introduced new issues).

4. **Prevention Recommendations** — For each root cause category with > 1 occurrence, suggest concrete preventive measures (ESLint rules, ADR updates, CLAUDE.md changes, CI checks).

5. **Actionable Items** — Prioritized table of specific, implementable next steps with impact and effort estimates.

6. **Summary** — 2-3 sentences summarizing the core problem and biggest improvement opportunity.

## Constraints
- Be brutally honest — the goal is to improve, not to assign blame
- Focus on systemic fixes (tooling, processes, instructions)
- Quantify everything: counts, percentages, rounds per category
- If there are fewer than 3 review comments, state "Minimal review activity — no retrospective needed" and stop

## Output
Output ONLY the markdown content for the retrospective file. No code fences, no preamble.
Start with: # PR #{PR_NUMBER} Review Retrospective — {PR_TITLE}
PROMPT_END
)

# Replace placeholders
PROMPT="${PROMPT//\{PR_NUMBER\}/$PR_NUMBER}"
PROMPT="${PROMPT//\{PR_TITLE\}/$PR_TITLE}"

# --- Build Claude API request ---
print_info "Generating retrospective via Claude API..." >&2

# Assemble the user message with all context
USER_MESSAGE=$(cat <<MSG_END
## PR Metadata
$PR_META

## Commit History
$COMMIT_LOG

## PR Comments (full conversation)
$PR_COMMENTS

## Example Retrospectives (follow this format exactly)
$EXAMPLE_RETRO

## Review-Retro Template (analysis guidelines)
$RETRO_TEMPLATE
MSG_END
)

# Escape the messages for JSON
SYSTEM_JSON=$(echo "$PROMPT" | jq -Rs '.')
USER_JSON=$(echo "$USER_MESSAGE" | jq -Rs '.')

API_BODY=$(cat <<EOF
{
  "model": "claude-sonnet-4-5-20250929",
  "max_tokens": 8192,
  "system": $SYSTEM_JSON,
  "messages": [
    {
      "role": "user",
      "content": $USER_JSON
    }
  ]
}
EOF
)

# Call Claude API
RESPONSE=$(curl -s -w "\n%{http_code}" \
  "https://api.anthropic.com/v1/messages" \
  -H "content-type: application/json" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d "$API_BODY")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | sed '$d')

if [[ "$HTTP_CODE" != "200" ]]; then
  print_error "Claude API returned HTTP $HTTP_CODE"
  echo "$RESPONSE_BODY" >&2
  exit 1
fi

# Extract the text content from Claude's response
RETRO_CONTENT=$(echo "$RESPONSE_BODY" | jq -r '.content[0].text')

if [[ -z "$RETRO_CONTENT" || "$RETRO_CONTENT" == "null" ]]; then
  print_error "Empty response from Claude API"
  exit 1
fi

# --- Write the retrospective file ---
mkdir -p "$(dirname "$RETRO_PATH")"
echo "$RETRO_CONTENT" > "$RETRO_PATH"
print_success "Retrospective written to $RETRO_PATH" >&2

# --- Extract summary stats for Slack ---
# Count review rounds (lines starting with | **R in the Timeline table)
ROUNDS=$(grep -c '| \*\*R' "$RETRO_PATH" 2>/dev/null || echo "0")
# Count total threads mentioned
THREADS=$(grep -oP '\d+ threads' "$RETRO_PATH" | head -1 | grep -oP '\d+' || echo "0")
# Extract top category from Root Cause Classification table (first data row after header)
TOP_CATEGORY=$(grep -A1 '|-------' "$RETRO_PATH" | tail -1 | sed 's/|//g' | awk '{print $1, $2}' | sed 's/^ *//;s/ *$//' | head -1 || echo "Unknown")
# Check for "minimal review" skip
MINIMAL=$(grep -c "Minimal review activity" "$RETRO_PATH" 2>/dev/null || echo "0")

# Output JSON summary to stdout for downstream consumers
jq -n \
  --arg pr_number "$PR_NUMBER" \
  --arg pr_title "$PR_TITLE" \
  --arg pr_url "$PR_URL" \
  --arg retro_path "$RETRO_PATH" \
  --arg retro_filename "$RETRO_FILENAME" \
  --arg rounds "$ROUNDS" \
  --arg threads "$THREADS" \
  --arg top_category "$TOP_CATEGORY" \
  --arg minimal "$MINIMAL" \
  '{
    pr_number: $pr_number,
    pr_title: $pr_title,
    pr_url: $pr_url,
    retro_path: $retro_path,
    retro_filename: $retro_filename,
    rounds: ($rounds | tonumber),
    threads: ($threads | tonumber),
    top_category: $top_category,
    is_minimal: ($minimal | tonumber > 0)
  }'

#!/usr/bin/env bash

# 🎫 PreToolUse hook for validating GitHub issue tickets
# Intercepts `gh issue create` commands and validates the body against ticket template rules
# Outputs JSON with decision: "block" to prevent creating malformed tickets

set -euo pipefail

# Parse the JSON input from stdin
input=$(cat)
tool_name=$(echo "$input" | jq -r '.tool_name // empty')
command=$(echo "$input" | jq -r '.tool_input.command // empty')

# Only process Bash tool with gh issue create commands
if [ "$tool_name" != "Bash" ]; then
  exit 0
fi

if [[ ! "$command" =~ gh\ issue\ create ]]; then
  exit 0
fi

# Extract the body content from the command
# Handles both --body "..." and --body "$(cat <<'EOF'...EOF)"
extract_body() {
  local cmd="$1"

  # Try to extract HEREDOC content first (most common pattern)
  # Pattern: --body "$(cat <<'EOF' ... EOF )"
  if [[ "$cmd" =~ \-\-body.*\<\<[\'\"]?EOF ]]; then
    # Extract content between EOF markers
    body=$(echo "$cmd" | sed -n '/<<.*EOF/,/^EOF/p' | sed '1d;$d')
    echo "$body"
    return 0
  fi

  # Try simple --body "..." pattern
  if [[ "$cmd" =~ --body\ +\"([^\"]+)\" ]]; then
    echo "${BASH_REMATCH[1]}"
    return 0
  fi

  # Try --body '...' pattern
  if [[ "$cmd" =~ --body\ +\'([^\']+)\' ]]; then
    echo "${BASH_REMATCH[1]}"
    return 0
  fi

  return 1
}

# Extract body content
body=$(extract_body "$command" 2>/dev/null || echo "")

# If no body found, skip validation (might be interactive or using stdin)
if [ -z "$body" ]; then
  exit 0
fi

# Create temp file for validation
temp_file=$(mktemp /tmp/ticket-XXXXXX.md)
trap 'rm -f "$temp_file"' EXIT

# Write body to temp file
echo "$body" > "$temp_file"

# Run remark linter on the ticket
# Using the project's .remarkrc.mjs configuration
project_dir="$(dirname "$0")/../.."
cd "$project_dir" || exit 0

# Capture output and exit code separately (don't let set -e kill us)
output=$(npx remark --frail --rc-path .remarkrc.mjs "$temp_file" 2>&1) || exit_code=$?
exit_code=${exit_code:-0}

if [ "$exit_code" -ne 0 ]; then
  # Format the errors nicely - extract warning lines
  errors=$(echo "$output" | grep -E "warning" | sed 's/\x1b\[[0-9;]*m//g' | head -20)

  jq -n \
    --arg reason "🎫 Ticket validation failed - please fix the following issues:" \
    --arg errors "$errors" \
    --arg hint "See .github/ISSUE_TEMPLATE/ for the expected format" \
    '{
      "decision": "block",
      "reason": $reason,
      "errors": $errors,
      "hint": $hint
    }'
  exit 2
fi

# Validation passed
exit 0

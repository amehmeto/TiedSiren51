#!/usr/bin/env bash

# 🎫 PreToolUse hook for validating GitHub issue tickets
# Intercepts `gh issue create` and `gh issue edit` commands and validates the body against ticket template rules
# Outputs JSON with decision: "block" to prevent creating/editing malformed tickets

set -euo pipefail

# Parse the JSON input from stdin
input=$(cat)
tool_name=$(echo "$input" | jq -r '.tool_name // empty')
command=$(echo "$input" | jq -r '.tool_input.command // empty')

# Only process Bash tool with gh issue create/edit commands
if [ "$tool_name" != "Bash" ]; then
  exit 0
fi

# Match gh issue create/edit at start of command or after && ; ||
# Avoid matching text inside strings (like commit messages mentioning "gh issue")
if [[ ! "$command" =~ ^gh\ issue\ (create|edit) ]] && \
   [[ ! "$command" =~ (\&\&|;|\|\|)[[:space:]]*gh\ issue\ (create|edit) ]]; then
  exit 0
fi

# Extract the body content from the command
# Handles HEREDOC, double-quoted, and single-quoted --body arguments
extract_body() {
  local cmd="$1"

  # Method 1: HEREDOC pattern (most common for multi-line)
  # Pattern: --body "$(cat <<'EOF' ... EOF )"
  if [[ "$cmd" =~ \<\<[\'\"]?EOF ]]; then
    # Extract everything between the first EOF marker and the closing EOF
    body=$(printf '%s' "$cmd" | perl -0777 -pe "s/.*<<'?\"?EOF'?\"?\n?(.*?)\nEOF.*/\$1/s" 2>/dev/null)
    if [ -n "$body" ]; then
      printf '%s' "$body"
      return 0
    fi
  fi

  # Method 2: Use perl for robust double-quote extraction (handles escaped quotes)
  # Matches --body "..." including escaped quotes inside
  body=$(printf '%s' "$cmd" | perl -ne 'if (/--body\s+"((?:[^"\\]|\\.)*)"/s) { $b=$1; $b=~s/\\"/"/g; $b=~s/\\n/\n/g; print $b }' 2>/dev/null)
  if [ -n "$body" ]; then
    printf '%s' "$body"
    return 0
  fi

  # Method 3: Single-quoted string (no escape processing needed)
  body=$(printf '%s' "$cmd" | perl -ne "if (/--body\\s+'([^']*)'/) { print \$1 }" 2>/dev/null)
  if [ -n "$body" ]; then
    printf '%s' "$body"
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

# Write body to temp file (use printf to preserve special chars)
printf '%s\n' "$body" > "$temp_file"

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

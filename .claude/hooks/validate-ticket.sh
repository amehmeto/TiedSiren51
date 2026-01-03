#!/usr/bin/env bash

# 🎫 PreToolUse hook for validating GitHub issue tickets
# Intercepts `gh issue create` and `gh issue edit` commands and validates the body against ticket template rules
# Outputs JSON with decision: "block" to prevent creating/editing malformed tickets

set -euo pipefail

# Parse the JSON input from stdin
input=$(cat)
tool_name=$(printf '%s' "$input" | jq -r '.tool_name // empty')
command=$(printf '%s' "$input" | jq -r '.tool_input.command // empty')

# Convert escaped newlines to actual newlines (Claude Code escapes them in JSON)
command=$(printf '%s' "$command" | sed 's/\\n/\n/g')

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

# First, validate the ticket
output=$(npx remark --frail --rc-path .remarkrc.mjs "$temp_file" 2>&1) || exit_code=$?
exit_code=${exit_code:-0}

if [ "$exit_code" -ne 0 ]; then
  # Validation failed - try to auto-fix
  original_content=$(cat "$temp_file")

  # Run remark in fix mode (writes fixed content back to file)
  npx remark --output --rc-path .remarkrc.fix.mjs "$temp_file" 2>&1 || true

  fixed_content=$(cat "$temp_file")

  # Check if fix mode added any sections
  if [ "$original_content" != "$fixed_content" ]; then
    # Content was fixed - re-validate
    revalidate_output=$(npx remark --frail --rc-path .remarkrc.mjs "$temp_file" 2>&1) || revalidate_code=$?
    revalidate_code=${revalidate_code:-0}

    if [ "$revalidate_code" -eq 0 ]; then
      # Fix succeeded and validation passes - suggest the fixed version
      # Escape the fixed content for JSON
      escaped_content=$(printf '%s' "$fixed_content" | jq -Rs .)

      jq -n \
        --arg reason "🔧 Ticket was auto-fixed! Missing sections have been added." \
        --argjson fixed_body "$escaped_content" \
        --arg hint "Please retry with the fixed body content below:" \
        '{
          "decision": "block",
          "reason": $reason,
          "fixed_body": $fixed_body,
          "hint": $hint
        }'
      exit 2
    else
      # Fix wasn't enough - still has errors
      remaining_errors=$(printf '%s' "$revalidate_output" | grep -E "warning" | sed 's/\x1b\[[0-9;]*m//g' | head -20)
      escaped_content=$(printf '%s' "$fixed_content" | jq -Rs .)

      jq -n \
        --arg reason "🔧 Ticket was partially fixed, but still has issues:" \
        --arg errors "$remaining_errors" \
        --argjson fixed_body "$escaped_content" \
        --arg hint "Please fix the remaining issues and retry with the partially fixed body:" \
        '{
          "decision": "block",
          "reason": $reason,
          "errors": $errors,
          "fixed_body": $fixed_body,
          "hint": $hint
        }'
      exit 2
    fi
  else
    # Fix mode didn't help (probably metadata issues, not missing sections)
    errors=$(printf '%s' "$output" | grep -E "warning" | sed 's/\x1b\[[0-9;]*m//g' | head -20)

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
fi

# Validation passed
exit 0

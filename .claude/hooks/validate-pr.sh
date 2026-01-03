#!/usr/bin/env bash

# 🔍 PreToolUse hook for validating GitHub PR titles and descriptions
# Intercepts `gh pr create` commands and validates against PR template rules
# Outputs JSON with decision: "block" to prevent creating malformed PRs

set -euo pipefail

# Parse the JSON input from stdin
input=$(cat)
tool_name=$(printf '%s' "$input" | jq -r '.tool_name // empty')
command=$(printf '%s' "$input" | jq -r '.tool_input.command // empty')

# Only process Bash tool with gh pr create commands
if [ "$tool_name" != "Bash" ]; then
  exit 0
fi

# Match gh pr create at start of command or after && ; ||
if [[ ! "$command" =~ ^gh\ pr\ create ]] && \
   [[ ! "$command" =~ (\&\&|;|\|\|)[[:space:]]*gh\ pr\ create ]]; then
  exit 0
fi

# Extract title from the command
extract_title() {
  local cmd="$1"

  # Try --title "..."
  title=$(printf '%s' "$cmd" | perl -ne 'if (/--title\s+"((?:[^"\\]|\\.)*)"/s) { $t=$1; $t=~s/\\"/"/g; print $t }' 2>/dev/null)
  if [ -n "$title" ]; then
    printf '%s' "$title"
    return 0
  fi

  # Try --title '...'
  title=$(printf '%s' "$cmd" | perl -ne "if (/--title\\s+'([^']*)'/) { print \$1 }" 2>/dev/null)
  if [ -n "$title" ]; then
    printf '%s' "$title"
    return 0
  fi

  # Try -t "..."
  title=$(printf '%s' "$cmd" | perl -ne 'if (/-t\s+"((?:[^"\\]|\\.)*)"/s) { $t=$1; $t=~s/\\"/"/g; print $t }' 2>/dev/null)
  if [ -n "$title" ]; then
    printf '%s' "$title"
    return 0
  fi

  return 1
}

# Extract body from the command
extract_body() {
  local cmd="$1"

  # Method 1: HEREDOC pattern
  if [[ "$cmd" =~ \<\<[\'\"]?EOF ]]; then
    body=$(printf '%s' "$cmd" | perl -0777 -pe "s/.*<<'?\"?EOF'?\"?\n?(.*?)\nEOF.*/\$1/s" 2>/dev/null)
    if [ -n "$body" ]; then
      printf '%s' "$body"
      return 0
    fi
  fi

  # Method 2: Double-quoted --body
  body=$(printf '%s' "$cmd" | perl -ne 'if (/--body\s+"((?:[^"\\]|\\.)*)"/s) { $b=$1; $b=~s/\\"/"/g; $b=~s/\\n/\n/g; print $b }' 2>/dev/null)
  if [ -n "$body" ]; then
    printf '%s' "$body"
    return 0
  fi

  # Method 3: Single-quoted --body
  body=$(printf '%s' "$cmd" | perl -ne "if (/--body\\s+'([^']*)'/) { print \$1 }" 2>/dev/null)
  if [ -n "$body" ]; then
    printf '%s' "$body"
    return 0
  fi

  # Method 4: -b flag
  body=$(printf '%s' "$cmd" | perl -ne 'if (/-b\s+"((?:[^"\\]|\\.)*)"/s) { $b=$1; $b=~s/\\"/"/g; $b=~s/\\n/\n/g; print $b }' 2>/dev/null)
  if [ -n "$body" ]; then
    printf '%s' "$body"
    return 0
  fi

  return 1
}

# Extract title and body
title=$(extract_title "$command" 2>/dev/null || echo "")
body=$(extract_body "$command" 2>/dev/null || echo "")

# If no title found, skip validation (might be interactive)
if [ -z "$title" ]; then
  exit 0
fi

# Navigate to project directory
project_dir="$(dirname "$0")/../.."
cd "$project_dir" || exit 0

# Run the PR linter
pr_json=$(jq -n --arg title "$title" --arg body "$body" '{"title": $title, "body": $body}')
output=$(printf '%s' "$pr_json" | node scripts/lint-pr.mjs --stdin --json 2>&1) || exit_code=$?
exit_code=${exit_code:-0}

if [ "$exit_code" -ne 0 ]; then
  # Parse the JSON output to get errors
  errors=$(printf '%s' "$output" | jq -r '
    [
      (.title.errors[]? | "📋 Title: " + .),
      (.body.errors[]? | "📄 Body: " + .)
    ] | join("\n")
  ' 2>/dev/null || echo "Validation failed")

  warnings=$(printf '%s' "$output" | jq -r '
    [
      (.title.warnings[]? | "📋 " + .),
      (.body.warnings[]? | "📄 " + .)
    ] | join("\n")
  ' 2>/dev/null || echo "")

  linked_tickets=$(printf '%s' "$output" | jq -r '
    if .linkedTickets | length > 0 then
      "🎫 Linked: " + ([.linkedTickets[] | "#" + (.number | tostring)] | join(", "))
    else
      "🎫 No tickets linked!"
    end
  ' 2>/dev/null || echo "")

  jq -n \
    --arg reason "🔍 PR validation failed - please fix the following:" \
    --arg errors "$errors" \
    --arg warnings "$warnings" \
    --arg tickets "$linked_tickets" \
    --arg hint "💡 Tip: Title must include ticket reference (e.g., feat: add feature #123)" \
    '{
      "decision": "block",
      "reason": $reason,
      "errors": $errors,
      "warnings": $warnings,
      "linked_tickets": $tickets,
      "hint": $hint
    }'
  exit 2
fi

# Validation passed - show summary
linked=$(printf '%s' "$output" | jq -r '[.linkedTickets[] | "#" + (.number | tostring)] | join(", ")' 2>/dev/null || echo "")
if [ -n "$linked" ]; then
  jq -n --arg tickets "$linked" '{
    "decision": "allow",
    "message": ("✅ PR links to tickets: " + $tickets)
  }'
fi

exit 0

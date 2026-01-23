#!/usr/bin/env bash

# 🔀 PreToolUse hook for validating GitHub Pull Requests
# Intercepts `gh pr create` and `gh pr edit` commands and validates against PR template rules
# Outputs JSON with decision: "block" to prevent creating/editing malformed PRs

set -euo pipefail

# Parse the JSON input from stdin
input=$(cat)
tool_name=$(printf '%s' "$input" | jq -r '.tool_name // empty')
command=$(printf '%s' "$input" | jq -r '.tool_input.command // empty')

# Only process Bash tool with gh pr create/edit commands
if [ "$tool_name" != "Bash" ]; then
  exit 0
fi

# Match gh pr create/edit at start of command or after && ; ||
if [[ ! "$command" =~ ^gh\ pr\ (create|edit) ]] && \
   [[ ! "$command" =~ (\&\&|;|\|\|)[[:space:]]*gh\ pr\ (create|edit) ]]; then
  exit 0
fi

# Extract the title from the command
extract_title() {
  local cmd="$1"
  local title=""

  # Try --title "..." (with escaped quote support)
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

  # Try -t "..." (short flag with escaped quote support)
  title=$(printf '%s' "$cmd" | perl -ne 'if (/-t\s+"((?:[^"\\]|\\.)*)"/s) { $t=$1; $t=~s/\\"/"/g; print $t }' 2>/dev/null)
  if [ -n "$title" ]; then
    printf '%s' "$title"
    return 0
  fi

  # Try -t '...'
  title=$(printf '%s' "$cmd" | perl -ne "if (/-t\\s+'([^']*)'/) { print \$1 }" 2>/dev/null)
  if [ -n "$title" ]; then
    printf '%s' "$title"
    return 0
  fi

  return 1
}

# Extract the body content from the command
extract_body() {
  local cmd="$1"

  # Method 1: HEREDOC pattern (most common for multi-line)
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

  # Method 4: Double-quoted -b (short flag)
  body=$(printf '%s' "$cmd" | perl -ne 'if (/-b\s+"((?:[^"\\]|\\.)*)"/s) { $b=$1; $b=~s/\\"/"/g; $b=~s/\\n/\n/g; print $b }' 2>/dev/null)
  if [ -n "$body" ]; then
    printf '%s' "$body"
    return 0
  fi

  # Method 5: Single-quoted -b (short flag)
  body=$(printf '%s' "$cmd" | perl -ne "if (/-b\\s+'([^']*)'/) { print \$1 }" 2>/dev/null)
  if [ -n "$body" ]; then
    printf '%s' "$body"
    return 0
  fi

  return 1
}

# Validation errors array
errors=()

# Extract title and body
title=$(extract_title "$command" 2>/dev/null || echo "")
body=$(extract_body "$command" 2>/dev/null || echo "")

# Skip validation if no body (might be interactive)
if [ -z "$body" ]; then
  exit 0
fi

# ============================================================================
# VALIDATION RULES
# ============================================================================

# Rule 1: Body must have a ## Summary section
if ! echo "$body" | grep -qE '^## Summary'; then
  errors+=("❌ Missing required section: ## Summary")
fi

# Rule 2: Body must have a ## Test plan section
if ! echo "$body" | grep -qiE '^## Test [Pp]lan'; then
  errors+=("❌ Missing required section: ## Test plan")
fi

# Rule 3: Body must have a ## 🔗 Hierarchy section with issue link
if ! echo "$body" | grep -qE '^## 🔗 Hierarchy'; then
  errors+=("❌ Missing required section: ## 🔗 Hierarchy")
else
  # Check for issue link in hierarchy table (📋 Issue row with Closes/Fixes/Resolves #NNN or markdown link)
  if ! echo "$body" | grep -qE '📋 Issue.*#[0-9]+'; then
    errors+=("❌ Hierarchy section must include '📋 Issue' row with issue reference (e.g., 'Closes #184')")
  fi
fi

# Rule 4: Must also have Closes/Fixes/Resolves for auto-close functionality
combined="$title $body"
has_close_ref=false
if echo "$combined" | grep -qiE '(Closes|Fixes|Resolves)\s+#[0-9]+'; then
  has_close_ref=true
fi
if [ "$has_close_ref" = false ]; then
  errors+=("❌ PR must include 'Closes #NNN', 'Fixes #NNN', or 'Resolves #NNN' for auto-close")
fi

# ============================================================================
# OUTPUT RESULT
# ============================================================================

if [ ${#errors[@]} -gt 0 ]; then
  # Build error message
  error_msg=$(printf '%s\n' "${errors[@]}")

  # Build hint with expected format
  hint="Expected PR format:

Title: feat(scope): description

Body:
## Summary
- Brief description of changes

## 🔗 Hierarchy

| Level | Link |
|-------|------|
| 🚀 Initiative | [#XX - Name](https://github.com/amehmeto/TiedSiren51/issues/XX) |
| 🏔️ Epic | [#XX - Name](https://github.com/amehmeto/TiedSiren51/issues/XX) |
| 📋 Issue | Closes #ISSUE_NUMBER |  ← 'Closes/Fixes/Resolves' auto-closes issue on merge

## Test plan
- [x] Tests pass
- [x] Lint passes

🤖 Generated with [Claude Code](https://claude.com/claude-code)"

  jq -n \
    --arg reason "🔀 PR validation failed - please fix the following issues:" \
    --arg errors "$error_msg" \
    --arg hint "$hint" \
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

#!/usr/bin/env bash

# PostToolUse hook for validating TypeScript/ESLint after file edits
# Outputs JSON with decision: "block" to provide feedback to Claude

# Parse the JSON input from stdin
input=$(cat)
file_path=$(echo "$input" | jq -r '.tool_input.file_path // .tool_input.path // empty')

# If no file path found, exit silently
if [ -z "$file_path" ]; then
  exit 0
fi

# Only validate TypeScript/JavaScript files
if [[ ! "$file_path" =~ \.(ts|tsx|js|jsx)$ ]]; then
  exit 0
fi

# Skip node_modules
if [[ "$file_path" =~ node_modules ]]; then
  exit 0
fi

# Check if file exists
if [ ! -f "$file_path" ]; then
  exit 0
fi

# Run ESLint on the file (with auto-fix for trivial issues)
eslint_output=$(npx eslint "$file_path" --fix 2>&1)
eslint_exit=$?

if [ $eslint_exit -ne 0 ]; then
  # Filter to get just the error lines
  filtered_output=$(echo "$eslint_output" | grep -E "^\s+[0-9]+:[0-9]+\s+error" || echo "$eslint_output")

  # Output JSON to stdout for Claude to see
  jq -n \
    --arg reason "ESLint validation failed for $file_path" \
    --arg errors "$filtered_output" \
    '{
      "decision": "block",
      "reason": $reason,
      "eslintErrors": $errors
    }'
  exit 2
fi

exit 0

#!/usr/bin/env bash

# PostToolUse hook for validating TypeScript/ESLint after file edits
# Exit code 2 blocks the edit and sends feedback to Claude

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

errors=""

# Run ESLint on the file (with auto-fix for trivial issues)
eslint_output=$(npx eslint "$file_path" --fix 2>&1) || {
  eslint_exit=$?
  if [ $eslint_exit -ne 0 ]; then
    # Filter out the summary line and only keep actual errors
    filtered_output=$(echo "$eslint_output" | grep -v "^$" | grep -v "problems")
    if [ -n "$filtered_output" ]; then
      errors+="ESLint errors:
$filtered_output

"
    fi
  fi
}

# If there are errors, exit with code 2 to block and provide feedback
if [ -n "$errors" ]; then
  echo "File validation failed for: $file_path" >&2
  echo "" >&2
  echo "$errors" >&2
  echo "Please fix these issues before proceeding." >&2
  exit 2
fi

exit 0

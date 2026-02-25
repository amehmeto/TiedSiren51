#!/usr/bin/env bash

# PostToolUse hook for validating files after edits
# Mirrors lint-staged configuration for consistency
# Outputs JSON with decision: "block" to provide feedback to Claude

# Parse the JSON input from stdin
input=$(cat)
file_path=$(echo "$input" | jq -r '.tool_input.file_path // .tool_input.path // empty')

# If no file path found, exit silently
if [ -z "$file_path" ]; then
  exit 0
fi

# Skip node_modules and non-existent files
if [[ "$file_path" =~ node_modules ]] || [ ! -f "$file_path" ]; then
  exit 0
fi

# Get file extension
filename=$(basename "$file_path")
extension="${filename##*.}"

# Determine which linters to run based on file type (mirrors lint-staged config)
case "$extension" in
  ts|tsx|js|jsx)
    # ESLint with auto-fix, then prettier
    output=$(npx eslint "$file_path" --fix 2>&1)
    exit_code=$?
    if [ $exit_code -ne 0 ]; then
      filtered=$(echo "$output" | grep -E "^\s+[0-9]+:[0-9]+\s+error" || echo "$output")
      jq -n --arg reason "ESLint failed: $file_path" --arg errors "$filtered" \
        '{"decision": "block", "reason": $reason, "errors": $errors}'
      exit 2
    fi
    npx prettier --write "$file_path" >/dev/null 2>&1
    ;;
  json)
    # Prettier for JSON
    output=$(npx prettier --write --parser json "$file_path" 2>&1)
    exit_code=$?
    if [ $exit_code -ne 0 ]; then
      jq -n --arg reason "Prettier failed: $file_path" --arg errors "$output" \
        '{"decision": "block", "reason": $reason, "errors": $errors}'
      exit 2
    fi
    # Also run eslint for .claude/**/*.json files
    if [[ "$file_path" =~ \.claude/ ]]; then
      output=$(npx eslint "$file_path" --fix 2>&1)
      exit_code=$?
      if [ $exit_code -ne 0 ]; then
        jq -n --arg reason "ESLint failed: $file_path" --arg errors "$output" \
          '{"decision": "block", "reason": $reason, "errors": $errors}'
        exit 2
      fi
    fi
    ;;
  md)
    # Remark for markdown link validation
    output=$(npx remark --frail --use remark-validate-links "$file_path" 2>&1)
    exit_code=$?
    if [ $exit_code -ne 0 ]; then
      jq -n --arg reason "Remark validation failed: $file_path" --arg errors "$output" \
        '{"decision": "block", "reason": $reason, "errors": $errors}'
      exit 2
    fi
    ;;
  sh)
    # Shellcheck for shell scripts
    output=$(npx shellcheck "$file_path" 2>&1)
    exit_code=$?
    if [ $exit_code -ne 0 ]; then
      jq -n --arg reason "Shellcheck failed: $file_path" --arg errors "$output" \
        '{"decision": "block", "reason": $reason, "errors": $errors}'
      exit 2
    fi
    ;;
  yml|yaml)
    # Prettier for YAML
    output=$(npx prettier --write "$file_path" 2>&1)
    exit_code=$?
    if [ $exit_code -ne 0 ]; then
      jq -n --arg reason "Prettier failed: $file_path" --arg errors "$output" \
        '{"decision": "block", "reason": $reason, "errors": $errors}'
      exit 2
    fi
    ;;
esac

exit 0

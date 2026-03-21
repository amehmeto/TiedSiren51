#!/usr/bin/env bash
set -euo pipefail

# PreToolUse hook: block git push commands without sufficient timeout.
# The post-push hook runs ci-watch which polls CI until pass/fail (~3-4 min).
# A short timeout kills the process and silently bypasses ci-watch.

input=$(cat)
command=$(echo "$input" | jq -r '.tool_input.command // empty')

# Only check commands that contain git push
if ! echo "$command" | grep -q 'git push'; then
  exit 0
fi

timeout=$(echo "$input" | jq -r '.tool_input.timeout // empty')

# Default Bash timeout is 120000ms (2 min) — not enough for ci-watch.
# Require at least 600000ms (10 min) to let the script control its own lifecycle.
min_timeout=600000

if [ -z "$timeout" ] || [ "$timeout" -lt "$min_timeout" ] 2>/dev/null; then
  jq -n \
    --arg reason "git push requires timeout: 600000 so ci-watch can complete" \
    '{
      "decision": "block",
      "reason": $reason
    }'
  exit 2
fi

exit 0

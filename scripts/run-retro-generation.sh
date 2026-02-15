#!/usr/bin/env bash
set -euo pipefail

# Wrapper for generate-retro.sh that writes outputs to GITHUB_OUTPUT.
#
# Usage: ./scripts/run-retro-generation.sh <PR_NUMBER>
# Env: GH_TOKEN, ANTHROPIC_API_KEY, GITHUB_OUTPUT

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/lib/colors.sh"

PR_NUMBER="${1:-}"
if [[ -z "$PR_NUMBER" ]]; then
  print_error "PR number is required"
  exit 1
fi

RETRO_JSON=$(bash "$SCRIPT_DIR/generate-retro.sh" "$PR_NUMBER")
RETRO_PATH=$(echo "$RETRO_JSON" | jq -r '.retro_path')
IS_MINIMAL=$(echo "$RETRO_JSON" | jq -r '.is_minimal')

# Use delimiter syntax for multiline JSON value
DELIMITER="EOF_$(date +%s)"
{
  echo "retro_json<<${DELIMITER}"
  echo "$RETRO_JSON"
  echo "$DELIMITER"
  echo "retro_path=$RETRO_PATH"
  echo "is_minimal=$IS_MINIMAL"
} >> "$GITHUB_OUTPUT"

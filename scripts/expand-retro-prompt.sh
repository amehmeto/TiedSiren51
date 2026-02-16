#!/usr/bin/env bash
set -euo pipefail

# Expand the retro slash command template with the PR number.
#
# Usage: ./scripts/expand-retro-prompt.sh <pr_number> <github_output_file>
#
# Reads .claude/commands/retro.md, substitutes $ARGUMENTS with the PR number,
# and writes the result as a multiline `prompt` output for GitHub Actions.

PR_NUMBER="${1:?PR number is required}"
GITHUB_OUTPUT_FILE="${2:?GITHUB_OUTPUT file path is required}"

PROMPT=$(sed "s/\$ARGUMENTS/${PR_NUMBER}/g" .claude/commands/retro.md)

{
  echo 'prompt<<RETRO_PROMPT_EOF'
  echo "$PROMPT"
  echo 'RETRO_PROMPT_EOF'
} >> "$GITHUB_OUTPUT_FILE"

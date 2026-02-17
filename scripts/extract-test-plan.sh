#!/usr/bin/env bash
set -euo pipefail

# Extract QA-relevant test plan from a GitHub issue and format for Slack mrkdwn.
#
# Extracts from both feature and bug issue templates:
#   - Acceptance Criteria (requirements checklist)
#   - Reproduction steps (bug template)
#   - Scenarios (Given/When/Then Gherkin blocks)
#   - Test Cases (tables → bullet lists)
#
# Usage: ./scripts/extract-test-plan.sh <issue_number> [repository]
# Requires: gh CLI authenticated (GH_TOKEN env var or gh auth login)
# Output: Slack mrkdwn formatted test plan (stdout)
#
# Note: Issue number is extracted from the TS branch naming convention
#       (e.g., feat/TS300-description → issue 300). Branches without a TS
#       prefix (TSBO, EAS, etc.) won't have a test plan extracted.

ISSUE_NUMBER="${1:-}"
REPOSITORY="${2:-}"

if [[ -z "$ISSUE_NUMBER" ]]; then
  echo "Usage: $0 <issue_number> [repository]" >&2
  exit 1
fi

# Build optional --repo flag for CI environments where git context may differ
REPO_FLAG=()
if [[ -n "$REPOSITORY" ]]; then
  REPO_FLAG=(--repo "$REPOSITORY")
fi

# Fetch issue body via GitHub CLI
BODY=$(gh issue view "$ISSUE_NUMBER" "${REPO_FLAG[@]}" --json body --jq '.body // ""' 2>/dev/null) || {
  echo "_Could not fetch issue #${ISSUE_NUMBER}_"
  exit 0
}

if [[ -z "$BODY" ]]; then
  echo "_No issue body found for #${ISSUE_NUMBER}_"
  exit 0
fi

# Strip HTML comments (single-line first, then multi-line ranges)
BODY=$(echo "$BODY" | sed 's/<!--.*-->//g' | sed '/<!--/,/-->/d')

# Extract content between a ## heading matching pattern and the next ## heading.
# Usage: extract_section "Acceptance Criteria"
extract_section() {
  local pattern="$1"
  echo "$BODY" | awk -v pat="$pattern" '
    $0 ~ ("^## .*" pat) { found=1; next }
    found && /^## / { found=0 }
    found && /^---$/ { next }
    found { print }
  '
}

AC_SECTION=$(extract_section "Acceptance Criteria")
TC_SECTION=$(extract_section "Test Cases")
REPRO_SECTION=$(extract_section "Reproduction")

OUTPUT=""

# --- Acceptance Criteria requirements ---
if [[ -n "$AC_SECTION" ]]; then
  REQS=$(echo "$AC_SECTION" \
    | grep -E '^\s*-\s*\[' \
    | sed 's/^[[:space:]]*- \[ \] /• /; s/^[[:space:]]*- \[x\] /• /' \
    || true)
  if [[ -n "$REQS" ]]; then
    OUTPUT+="*Acceptance Criteria*"$'\n'"${REQS}"$'\n'
  fi
fi

# --- Reproduction steps (bug template only) ---
if [[ -n "$REPRO_SECTION" ]]; then
  STEPS=$(echo "$REPRO_SECTION" | awk '
    /^### .*Steps to Reproduce/ { found=1; next }
    found && /^### / { found=0 }
    found && /^[0-9]+\./ { print }
  ' || true)
  if [[ -n "$STEPS" ]]; then
    [[ -n "$OUTPUT" ]] && OUTPUT+=$'\n'
    OUTPUT+="*Steps to Reproduce*"$'\n'"${STEPS}"$'\n'
  fi
fi

# --- Scenarios (from both Acceptance Criteria and Reproduction sections) ---
COMBINED=""
[[ -n "$AC_SECTION" ]] && COMBINED="$AC_SECTION"
if [[ -n "$REPRO_SECTION" ]]; then
  [[ -n "$COMBINED" ]] && COMBINED+=$'\n'
  COMBINED+="$REPRO_SECTION"
fi

SCENARIOS=""
if [[ -n "$COMBINED" ]]; then
  SCENARIOS=$(echo "$COMBINED" | awk '
    /^###+ .*[Ss]cenario/ {
      title = $0
      gsub(/^#+ /, "", title)
      gsub(/^[^A-Za-z]*/, "", title)
      printf "_%s_\n", title
      next
    }
    /^```gherkin/ { in_block=1; print "```"; next }
    /^```/ && in_block { in_block=0; print "```"; next }
    in_block { print }
  ' || true)
fi

if [[ -n "$SCENARIOS" ]]; then
  [[ -n "$OUTPUT" ]] && OUTPUT+=$'\n'
  OUTPUT+="*Scenarios*"$'\n'"${SCENARIOS}"$'\n'
fi

# --- Test Cases (convert markdown tables to bullet lists) ---
if [[ -n "$TC_SECTION" ]]; then
  CASES=$(echo "$TC_SECTION" | awk '
    /^### / {
      title = $0
      gsub(/^### /, "", title)
      gsub(/^[^A-Za-z]*/, "", title)
      printf "\n_%s_\n", title
      past_header = 0
      next
    }
    /^\|[[:space:]]*[-]+/ { past_header=1; next }
    /^\|/ && !past_header { next }
    /^\|/ {
      n = split($0, c, "|")
      for (i = 2; i < n; i++) {
        gsub(/^[[:space:]]+|[[:space:]]+$/, "", c[i])
      }
      if (c[2] == "") next
      printf "• %s", c[2]
      if (c[3] != "") printf " → %s", c[3]
      if (n > 4 && c[4] != "" && c[4] !~ /^[[:space:]]*$/) printf " (%s)", c[4]
      printf "\n"
    }
  ' || true)
  if [[ -n "$CASES" ]]; then
    [[ -n "$OUTPUT" ]] && OUTPUT+=$'\n'
    OUTPUT+="*Test Cases*${CASES}"$'\n'
  fi
fi

# Truncate if over Slack block limit (3000 chars max, leave margin for header).
# ${#OUTPUT} counts bytes in some locales — with emoji-heavy content this may
# truncate earlier than 2800 characters, which is safe (better short than rejected).
if [[ ${#OUTPUT} -gt 2800 ]]; then
  OUTPUT="${OUTPUT:0:2750}..."$'\n\n'"_(truncated — see full issue for details)_"
fi

# Fallback if nothing was extracted
if [[ -z "$OUTPUT" ]]; then
  OUTPUT="_No test plan found in issue #${ISSUE_NUMBER}_"
fi

printf '%s\n' "$OUTPUT"

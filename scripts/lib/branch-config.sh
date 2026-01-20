#!/usr/bin/env bash
# shellcheck disable=SC2034 # Variables are used by scripts that source this file

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ SHARED BRANCH NAMING CONFIGURATION                                          │
# │ Used by: start-issue.sh, branch-name-check.sh                               │
# └─────────────────────────────────────────────────────────────────────────────┘

# TICKET_PREFIX: Project identifier prepended to issue numbers in branch names
#   Examples: "TS" → feat/TS123-description
#             "TSBO-" → feat/TSBO-123-description
#             "EAS-" → feat/EAS-123-description
#             "" → feat/123-description (no prefix)
TICKET_PREFIX="TS"

# REQUIRE_ISSUE_NUMBER: Enforce ticket numbers in branch names
#   "true"  → require: feat/TS123-description
#   "false" → allow both: feat/TS123-description OR feat/description
REQUIRE_ISSUE_NUMBER="true"

# TYPE_PREFIXES: Conventional commit type prefixes for branch naming
# Order matters: longer prefixes first to avoid partial matches
TYPE_PREFIXES="refactor feat fix docs chore test perf build ci style feature"

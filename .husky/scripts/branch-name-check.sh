#!/usr/bin/env bash

# Branch naming convention check
#
# Configuration: Set REQUIRE_ISSUE_NUMBER to enforce issue numbers in branch names
# Set to "true" to require issue numbers: feat/42-description
# Set to "false" (default) to allow both: feat/42-description OR feat/description
REQUIRE_ISSUE_NUMBER="true"

# Supported formats:
#   1. Issue-based (recommended): <type>/<issue-number>-<description>
#      Example: feat/42-add-dark-mode, fix/123-resolve-login-bug
#   2. Legacy (when REQUIRE_ISSUE_NUMBER=false): <type>/<description>
#      Example: feat/add-new-feature, fix/bug-description
#
# Use /start-issue <number> to automatically create properly named branches

branch=$(git branch --show-current)
keywords="feat, fix, refactor, docs, chore, test, perf, build, ci, style, feature"

# Build pattern based on configuration
if [ "$REQUIRE_ISSUE_NUMBER" = "true" ]; then
  # Require issue number: feat/42-description
  pattern="^(feature|feat|fix|build|chore|ci|docs|style|refactor|perf|test)\/[0-9]+-[a-z0-9][a-z0-9-]*$"
  example_required="feat/42-add-dark-mode"
else
  # Allow both formats: feat/42-description OR feat/description
  pattern="^(feature|feat|fix|build|chore|ci|docs|style|refactor|perf|test)\/([0-9]+-)?[a-z0-9][a-z0-9-]*$"
fi

if ! echo "$branch" | grep -Eq "$pattern"; then
  printf "\033[0;35mBranch name '%s' does not follow the required pattern.\033[0m\n\n" "$branch"
  printf "\033[0;35mBranch name must start with a conventional commit keyword (%s),\n" "$keywords"

  if [ "$REQUIRE_ISSUE_NUMBER" = "true" ]; then
    printf "followed by '/<issue-number>-<description>'.\033[0m\n\n"
    printf "\033[0;35mExample: %s\033[0m\n\n" "$example_required"
  else
    printf "followed by '/<issue-number>-<description>' or '/<description>'.\033[0m\n\n"
    printf "\033[0;35mExamples:\033[0m\n"
    printf "  \033[0;35m• feat/42-add-dark-mode (issue-based, recommended)\033[0m\n"
    printf "  \033[0;35m• fix/resolve-login-bug (legacy)\033[0m\n\n"
  fi

  printf "\033[0;35mTip: Use '/start-issue <number>' to automatically create properly named branches.\033[0m\n\n"
  printf "\033[0;35mTo rename this local branch, try: \`git branch -m <newname>\`\033[0m\n\n"
  exit 1
fi

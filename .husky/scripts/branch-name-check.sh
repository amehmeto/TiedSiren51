#!/usr/bin/env bash

# Branch naming convention check
# Configuration is loaded from scripts/lib/branch-config.sh

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Load shared branch naming configuration
# shellcheck disable=SC1091 # Path is dynamic but verified at runtime
source "$REPO_ROOT/scripts/lib/branch-config.sh"

branch=$(git branch --show-current)
keywords="feat, fix, refactor, docs, chore, test, perf, build, ci, style, feature"

# Build pattern based on configuration
# Escape special regex characters in prefix (e.g., hyphens)
# shellcheck disable=SC2016 # Single quotes intentional - we want literal regex, not expansion
escaped_prefix=$(printf '%s' "$TICKET_PREFIX" | sed 's/[.[\*^$()+?{|]/\\&/g')

if [ "$REQUIRE_ISSUE_NUMBER" = "true" ]; then
  # Require ticket number: feat/TS123-description
  pattern="^(feature|feat|fix|build|chore|ci|docs|style|refactor|perf|test)\/${escaped_prefix}[0-9]+-[a-z0-9][a-z0-9-]*$"
  example_format="<type>/${TICKET_PREFIX}<number>-<description>"
  example_branch="feat/${TICKET_PREFIX}42-add-dark-mode"
else
  # Allow both formats: feat/TS123-description OR feat/description
  pattern="^(feature|feat|fix|build|chore|ci|docs|style|refactor|perf|test)\/(${escaped_prefix}[0-9]+-)?[a-z0-9][a-z0-9-]*$"
  example_format="<type>/${TICKET_PREFIX}<number>-<description> or <type>/<description>"
  example_branch="feat/${TICKET_PREFIX}42-add-dark-mode"
  example_legacy="feat/add-dark-mode"
fi

if ! echo "$branch" | grep -Eq "$pattern"; then
  printf "\033[0;35mBranch name '%s' does not follow the required pattern.\033[0m\n\n" "$branch"
  printf "\033[0;35mBranch name must start with a conventional commit keyword (%s),\n" "$keywords"
  printf "followed by '%s'.\033[0m\n\n" "$example_format"

  if [ "$REQUIRE_ISSUE_NUMBER" = "true" ]; then
    printf "\033[0;35mExample: %s\033[0m\n\n" "$example_branch"
  else
    printf "\033[0;35mExamples:\033[0m\n"
    printf "  \033[0;35m• %s (with ticket, recommended)\033[0m\n" "$example_branch"
    printf "  \033[0;35m• %s (legacy)\033[0m\n\n" "$example_legacy"
  fi

  printf "\033[0;35mTip: Use '/start-issue <number>' to automatically create properly named branches.\033[0m\n\n"
  printf "\033[0;35mTo rename this local branch, try: \`git branch -m <newname>\`\033[0m\n\n"
  exit 1
fi

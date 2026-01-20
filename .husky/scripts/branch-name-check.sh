#!/usr/bin/env bash

# Branch naming convention check
# Supports two formats:
#   1. Issue-based (recommended): <type>/<issue-number>-<description>
#      Example: feat/42-add-dark-mode, fix/123-resolve-login-bug
#   2. Legacy: <type>/<description>
#      Example: feat/add-new-feature, fix/bug-description
#
# Use /start-issue <number> to automatically create properly named branches

branch=$(git branch --show-current)
keywords="feat, fix, refactor, docs, chore, test, perf, build, ci, style, feature"

# Pattern supports both issue-based and legacy formats
# Issue-based: feat/42-description or fix/123-something
# Legacy: feat/description or fix/something
pattern="^(feature|feat|fix|build|chore|ci|docs|style|refactor|perf|test)\/([0-9]+-)?[a-z0-9][a-z0-9-]*$"

if ! echo "$branch" | grep -Eq "$pattern"; then
  printf "\033[0;35mBranch name '%s' does not follow the required pattern.\033[0m\n\n" "$branch"
  printf "\033[0;35mBranch name must start with a conventional commit keyword (%s),\n" "$keywords"
  printf "followed by '/<issue-number>-<description>' or '/<description>'.\033[0m\n\n"
  printf "\033[0;35mExamples:\033[0m\n"
  printf "  \033[0;35m• feat/42-add-dark-mode (issue-based, recommended)\033[0m\n"
  printf "  \033[0;35m• fix/resolve-login-bug (legacy)\033[0m\n\n"
  printf "\033[0;35mTip: Use '/start-issue <number>' to automatically create properly named branches.\033[0m\n\n"
  printf "\033[0;35mTo rename this local branch, try: \`git branch -m <newname>\`\033[0m\n\n"
  exit 1
fi

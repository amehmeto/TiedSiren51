#!/bin/sh

# Configuration: Set TICKET_PREFIX to require ticket numbers in branch names
# Examples: TICKET_PREFIX="MA2" or TICKET_PREFIX="JIRA"
# Leave empty ("") to disable ticket prefix requirement
TICKET_PREFIX=""

branch=$(git branch --show-current)
keywords="feature, feat, fix, build, chore, ci, docs, style, refactor, perf, test"

# Build pattern and example based on configuration
if [ -n "$TICKET_PREFIX" ]; then
  # With ticket prefix: feature/MA2-123-description
  pattern="^(feature|feat|fix|build|chore|ci|docs|style|refactor|perf|test)\/${TICKET_PREFIX}-[0-9]+-.+$"
  example="feature/${TICKET_PREFIX}-123-add-new-feature"
else
  # Without ticket prefix: feature/description
  pattern="^(feature|feat|fix|build|chore|ci|docs|style|refactor|perf|test)\/.+$"
  example="feature/add-new-feature"
fi

if ! echo "$branch" | grep -Eq "$pattern"; then
  printf "\033[0;35mBranch name '%s' does not follow the required pattern.\033[0m\n\n" "$branch"

  # Print error message with keywords listed
  if [ -n "$TICKET_PREFIX" ]; then
    printf "\033[0;35mBranch name must start with a conventional commit keyword (%s),\n followed by '/%s-XXX-description'.\033[0m\n\n" "$keywords" "$TICKET_PREFIX"
  else
    printf "\033[0;35mBranch name must start with a conventional commit keyword (%s),\n followed by '/description'.\033[0m\n\n" "$keywords"
  fi

  printf "\033[0;35mExample: '%s'.\033[0m\n\n" "$example"
  printf "\033[0;35mTo rename this local branch, try: \`git branch -m <newname>\`\033[0m\n\n"
  exit 1
fi

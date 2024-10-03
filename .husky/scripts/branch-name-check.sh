#!/bin/sh

branch=$(git branch --show-current)
pattern="^(feature|fix|build|chore|ci|docs|chore|style|refactor|perf|test)\/.+$"

if ! [[ "$branch" =~ $pattern ]]; then
  printf "\033[0;35mBranch name '%s' does not follow the required pattern.\033[0m\n\n" "$branch"
  printf "\033[0;35mBranch name must start with a conventional commit keyword,\n followed by '/MA2-XXX-description'.\033[0m\n\n"
  printf "\033[0;35mExample: 'feature/MA2-123-add-new-feature'.\033[0m\n\n"
  printf  "\033[0;35mTo rename this local branch, try: \`git branch -m <newname>\`\033[0m\n\n"
  exit 1
fi

#!/bin/sh

branch=$(git branch --show-current)

if [ "$branch" = "main" ] || [ "$branch" = "demo" ]; then
  printf "\033[0;35Error: Direct commits to the %s branch are not allowed." "$branch"
  exit 1
fi

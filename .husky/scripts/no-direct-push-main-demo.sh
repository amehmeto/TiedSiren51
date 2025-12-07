#!/usr/bin/env bash

branch=$(git branch --show-current)

if [ "$branch" = "main" ] || [ "$branch" = "demo" ]; then
  printf "\033[0;35mDirect push to %s is not allowed.\033[0m\n" "$branch"
  exit 1
fi

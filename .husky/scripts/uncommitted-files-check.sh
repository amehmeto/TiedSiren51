#!/usr/bin/env bash

echo "Running 'npm run check:uncommitted'..."

if npm run check:uncommitted; then
  true
else
  printf "\033[0;35mError while running 'npm run check:uncommitted'. Make sure you committed all the changes or git stashed them\n\033[0m\n"
  exit 1
fi

#!/bin/sh

if [ -f "package-lock.json" ]; then
  printf "\033[0;35mError: package-lock.json file detected.\nThis project uses yarn.\nPlease remove the package-lock.json file.\n\n\033[0m\n"
  exit 1
else
  exit 0
fi

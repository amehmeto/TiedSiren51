#!/usr/bin/env bash
set -e

# Script to find the APK file built by EAS
# Usage: ./find-apk.sh

APK_PATH=$(find . -maxdepth 1 -name "build-*.apk" -type f | head -n 1)

if [ -z "$APK_PATH" ]; then
  echo "APK not found!"
  exit 1
fi

# Rename APK with project prefix
NEW_APK_PATH="./build-tied-siren-51-$(basename "$APK_PATH" | sed 's/^build-//')"
mv "$APK_PATH" "$NEW_APK_PATH"
APK_PATH="$NEW_APK_PATH"
APK_NAME=$(basename "$APK_PATH")

# Output for GitHub Actions
echo "apk_path=$APK_PATH" >> "$GITHUB_OUTPUT"
echo "apk_name=$APK_NAME" >> "$GITHUB_OUTPUT"
echo "Found APK: $APK_PATH"

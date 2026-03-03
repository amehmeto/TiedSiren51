#!/usr/bin/env bash
# Compare Expo fingerprint of the current branch against the cached main branch fingerprint.
# Outputs: native-changed=true|false to GITHUB_OUTPUT
#
# Usage: bash scripts/compare-fingerprint.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/lib/colors.sh"

GITHUB_OUTPUT="${GITHUB_OUTPUT:-/dev/null}"
BASE_FINGERPRINT="/tmp/base-fingerprint/fingerprint.json"

# Generate PR fingerprint
print_info "Generating fingerprint for current branch..."
PR_FINGERPRINT=$(npx @expo/fingerprint fingerprint:generate --platform android)

PR_HASH=$(node -p "JSON.parse(process.argv[1]).hash" "$PR_FINGERPRINT")
print_info "PR fingerprint hash: $PR_HASH"

# Check if base fingerprint exists
if [ ! -f "$BASE_FINGERPRINT" ]; then
  print_warning "No base fingerprint found — defaulting to native-changed=true"
  echo "native-changed=true" >> "$GITHUB_OUTPUT"
  exit 0
fi

BASE_HASH=$(node -p "JSON.parse(require('fs').readFileSync('$BASE_FINGERPRINT','utf8')).hash")
print_info "Base fingerprint hash: $BASE_HASH"

if [ "$PR_HASH" = "$BASE_HASH" ]; then
  print_success "Fingerprints match — no native changes detected"
  echo "native-changed=false" >> "$GITHUB_OUTPUT"
else
  print_warning "Fingerprints differ — native changes detected"

  # Show human-readable diff
  print_info "Generating diff summary..."
  DIFF_OUTPUT=$(npx @expo/fingerprint fingerprint:diff "$BASE_FINGERPRINT" --platform android 2>&1 || true)
  if [ -n "$DIFF_OUTPUT" ]; then
    echo "$DIFF_OUTPUT"
  fi

  echo "native-changed=true" >> "$GITHUB_OUTPUT"
fi

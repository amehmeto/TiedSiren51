#!/usr/bin/env bash
# Generate Expo fingerprint for the current project and save it for caching.
# Used by Hades to cache the main branch fingerprint baseline.
#
# Usage: bash scripts/generate-fingerprint.sh

set -euo pipefail

OUTPUT_DIR="/tmp/base-fingerprint"

mkdir -p "$OUTPUT_DIR"
npx @expo/fingerprint fingerprint:generate --platform android > "$OUTPUT_DIR/fingerprint.json"

echo "Fingerprint saved to $OUTPUT_DIR/fingerprint.json"

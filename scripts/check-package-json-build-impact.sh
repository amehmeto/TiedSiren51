#!/usr/bin/env bash

# Check if package.json changes affect the build
# Returns exit code 0 if build-relevant changes exist, 1 otherwise
#
# Build-relevant fields:
# - dependencies
# - devDependencies
# - peerDependencies
# - optionalDependencies
# - engines
# - overrides
# - resolutions
#
# Non-build-relevant fields (scripts, description, etc.) are ignored

set -euo pipefail

BASE_REF="${1:-origin/main}"

# Cross-platform sha256 (macOS uses shasum, Linux uses sha256sum)
sha256() {
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum | cut -d' ' -f1
  else
    shasum -a 256 | cut -d' ' -f1
  fi
}

# Check if package.json changed at all
if ! git diff --quiet "$BASE_REF" -- package.json 2>/dev/null; then
  # Get the build-relevant fields from both versions
  build_fields='{
    dependencies,
    devDependencies,
    peerDependencies,
    optionalDependencies,
    engines,
    overrides,
    resolutions
  }'

  base_hash=$(git show "$BASE_REF:package.json" 2>/dev/null | jq -S "$build_fields" | sha256)
  head_hash=$(jq -S "$build_fields" package.json | sha256)

  if [ "$base_hash" != "$head_hash" ]; then
    echo "build-impact=true"
  else
    echo "build-impact=false"
  fi
else
  echo "build-impact=false"
fi

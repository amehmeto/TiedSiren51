#!/usr/bin/env bash
set -euo pipefail

# Install platform-specific native binaries needed in CI (Linux x64).
# OxLint binding is always installed (version-pinned to lockfile).
# Pass additional package names as arguments for extra binaries.

OXLINT_VERSION=$(node -p "require('./package-lock.json').packages['node_modules/oxlint'].version")

npm install --no-save "$@" "@oxlint/binding-linux-x64-gnu@$OXLINT_VERSION"

#!/bin/bash
# Orchestrates all linting tasks
# Usage:
#   ./scripts/lint.sh        # Check mode (CI)
#   ./scripts/lint.sh --fix  # Auto-fix mode (local development)

set -e

FIX_SUFFIX=""
if [[ "$1" == "--fix" ]]; then
    FIX_SUFFIX=":fix"
fi

echo "Running lint:types..."
npm run lint:types

echo "Running lint:js${FIX_SUFFIX}..."
npm run "lint:js${FIX_SUFFIX}" -- "**/*.{js,ts,jsx,tsx}" ".claude/**/*.json" "tsconfig*.json"

echo "Running lint:format${FIX_SUFFIX}..."
npm run "lint:format${FIX_SUFFIX}" -- "**/*.{js,ts,jsx,tsx,json,yml,yaml}"

echo "Running lint:md..."
npm run lint:md -- "**/*.md"

echo "Running lint:sh..."
npm run lint:sh

echo "Running lint:workflow..."
npm run lint:workflow

echo "Running lint:schema..."
npm run lint:schema

echo "All linting passed!"

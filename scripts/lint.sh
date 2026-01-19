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

run_lint() {
    local script="$1"
    shift
    echo "Running ${script}..."
    if [[ $# -gt 0 ]]; then
        npm run "${script}" -- "$@"
    else
        npm run "${script}"
    fi
}

run_lint lint:types
run_lint "lint:js${FIX_SUFFIX}" "**/*.{js,ts,jsx,tsx}" ".claude/**/*.json" "tsconfig*.json"
run_lint "lint:format${FIX_SUFFIX}" "**/*.{js,ts,jsx,tsx,json,yml,yaml}"
run_lint lint:md "**/*.md"
run_lint lint:sh
run_lint lint:workflow
run_lint lint:schema

echo "All linting passed!"

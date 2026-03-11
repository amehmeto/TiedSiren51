#!/bin/sh
set -e
# PUSHED_BRANCH and PUSHED_SHA are set by reference-transaction hook
# SKIP_CI_WATCH: set to skip CI monitoring

if [ -n "${SKIP_CI_WATCH:-}" ]; then
  exit 0
fi

echo "Push completed! Now watching CI... (Ctrl+C to cancel)"

if [ -x "scripts/ci-watch.sh" ]; then
  scripts/ci-watch.sh
  ci_exit_code=$?

  # If CI passed, update PR description
  if [ $ci_exit_code -eq 0 ] && [ -x "scripts/update-pr-description.sh" ]; then
    scripts/update-pr-description.sh || true  # Non-fatal if it fails
  fi

  exit $ci_exit_code
else
  echo ""
  echo "=========================================="
  echo "[ERROR] ci-watch.sh not found or not executable!"
  echo "=========================================="
  echo "Expected location: scripts/ci-watch.sh"
  echo ""
  echo "To fix this, ensure scripts/ci-watch.sh exists and is executable:"
  echo "  chmod +x scripts/ci-watch.sh"
  echo ""
  exit 1
fi

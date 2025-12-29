#!/usr/bin/env bash
# Commit dependency graph if changed
#
# NOTE: This script is currently unused but kept for future use.
# It was designed for the update-dependency-graph.yml workflow which is now disabled.
# To use: uncomment the workflow trigger and the step that calls this script.

set -euo pipefail

git config user.name "github-actions[bot]"
git config user.email "github-actions[bot]@users.noreply.github.com"
git add docs/TICKET-DEPENDENCY-GRAPH.md
git diff --staged --quiet || (git commit -m "docs: auto-update dependency graph" && git push)

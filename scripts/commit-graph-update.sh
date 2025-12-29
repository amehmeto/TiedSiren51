#!/bin/bash
# Commit dependency graph if changed

git config user.name "github-actions[bot]"
git config user.email "github-actions[bot]@users.noreply.github.com"
git add docs/TICKET-DEPENDENCY-GRAPH.md
git diff --staged --quiet || git commit -m "docs: auto-update dependency graph" && git push

#!/bin/bash
# Detect the PR for the current branch.
# Outputs JSON: {"number":N,"url":"..."} or empty string if no PR exists.

BRANCH="$(git branch --show-current)"
gh pr list --head "$BRANCH" --json number,url --jq '.[0] // empty'

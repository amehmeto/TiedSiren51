#!/bin/bash
cd "/home/ubuntu/TiedSiren51/../ethernal-claude-issue-213"
echo "Installing dependencies..."
npm install
echo "Starting Claude Code with issue #213..."
claude "$(cat '/home/ubuntu/TiedSiren51/../ethernal-claude-issue-213/.claude-issue-prompt.md')"

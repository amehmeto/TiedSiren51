#!/bin/bash

set -e

# Check if issue number is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <issue-number>"
    exit 1
fi

ISSUE_NUMBER="$1"
REPO_ROOT=$(git rev-parse --show-toplevel)
WORKTREE_DIR="$REPO_ROOT/../ethernal-claude-issue-$ISSUE_NUMBER"
BRANCH_NAME="issue-$ISSUE_NUMBER"
SESSION_NAME="issue-$ISSUE_NUMBER"

# Fetch issue details from GitHub
echo "Fetching issue #$ISSUE_NUMBER..."
ISSUE_TITLE=$(gh issue view "$ISSUE_NUMBER" --json title -q '.title')
ISSUE_BODY=$(gh issue view "$ISSUE_NUMBER" --json body -q '.body')

if [ -z "$ISSUE_TITLE" ]; then
    echo "Error: Could not fetch issue #$ISSUE_NUMBER"
    exit 1
fi

echo "Issue fetched: $ISSUE_TITLE"

# Create worktree with a new branch
echo "Creating worktree at $WORKTREE_DIR..."
git fetch origin
git worktree add -b "$BRANCH_NAME" "$WORKTREE_DIR" origin/main

# Write issue content to a temp file for claude prompt
PROMPT_FILE="$WORKTREE_DIR/.claude-issue-prompt.md"
cat > "$PROMPT_FILE" << EOF
# Issue #$ISSUE_NUMBER: $ISSUE_TITLE

$ISSUE_BODY
EOF

# Create init script that will run inside tmux
INIT_SCRIPT="$WORKTREE_DIR/.claude-init.sh"
cat > "$INIT_SCRIPT" << EOF
#!/bin/bash
cd "$WORKTREE_DIR"
echo "Installing dependencies..."
npm install
echo "Starting Claude Code with issue #$ISSUE_NUMBER..."
claude "\$(cat '$PROMPT_FILE')"
EOF
chmod +x "$INIT_SCRIPT"

# Start tmux session
echo "Starting tmux session: $SESSION_NAME"
tmux new-session -d -s "$SESSION_NAME" -c "$WORKTREE_DIR"
tmux send-keys -t "$SESSION_NAME" "$INIT_SCRIPT" Enter

echo ""
echo "Done! Attach to the session with:"
echo "  tmux attach -t $SESSION_NAME"

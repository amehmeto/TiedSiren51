#!/bin/bash

set -e

# Check if issue number is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <issue-number>"
    exit 1
fi

ISSUE_NUMBER="$1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BRANCH_NAME="issue-$ISSUE_NUMBER"
SESSION_NAME="issue-$ISSUE_NUMBER"
WORKTREE_DIR=""

# Fetch issue details from GitHub
echo "Fetching issue #$ISSUE_NUMBER..."
ISSUE_TITLE=$(gh issue view "$ISSUE_NUMBER" --json title -q '.title')
ISSUE_BODY=$(gh issue view "$ISSUE_NUMBER" --json body -q '.body')

if [ -z "$ISSUE_TITLE" ]; then
    echo "Error: Could not fetch issue #$ISSUE_NUMBER"
    exit 1
fi

echo "Issue fetched: $ISSUE_TITLE"

# Create worktree using scripts/worktree.sh (handles branch creation, PR, npm ci)
echo "Creating worktree for branch $BRANCH_NAME..."
set +e
WORKTREE_OUTPUT=$("$REPO_ROOT/scripts/worktree.sh" "$BRANCH_NAME" 2>&1)
EXIT_CODE=$?
set -e

if [ $EXIT_CODE -eq 0 ]; then
    # Success - parse WORKTREE_PATH from output
    WORKTREE_DIR=$(echo "$WORKTREE_OUTPUT" | grep "^WORKTREE_PATH=" | cut -d= -f2)
    echo "$WORKTREE_OUTPUT"
elif [ $EXIT_CODE -eq 2 ]; then
    # Worktree already exists - find it via git worktree list
    echo "Worktree already exists, finding path..."
    while IFS= read -r line; do
        if [[ "$line" =~ ^worktree\ (.+)$ ]]; then
            wt_path="${BASH_REMATCH[1]}"
        elif [[ "$line" =~ ^branch\ refs/heads/(.+)$ ]] && [[ "${BASH_REMATCH[1]}" == "$BRANCH_NAME" ]]; then
            WORKTREE_DIR="$wt_path"
            break
        fi
    done < <(git worktree list --porcelain)

    if [ -n "$WORKTREE_DIR" ]; then
        echo "Found existing worktree at: $WORKTREE_DIR"
        (cd "$WORKTREE_DIR" && git pull --ff-only || true)
    fi
else
    echo "$WORKTREE_OUTPUT"
    exit $EXIT_CODE
fi

if [ -z "$WORKTREE_DIR" ]; then
    echo "Error: Could not determine worktree path"
    exit 1
fi

# Write issue content to a temp file for claude prompt
PROMPT_FILE="$WORKTREE_DIR/.claude-issue-prompt.md"
cat > "$PROMPT_FILE" << EOF
# Issue #$ISSUE_NUMBER: $ISSUE_TITLE

$ISSUE_BODY

---

## Instructions

1. Implement the issue above
2. When done, run \`/commit-push\` to commit and push your changes
3. Then open a PR with: \`gh pr create --title "$ISSUE_TITLE" --body "Closes #$ISSUE_NUMBER" --base main\`
EOF

# Create init script that will run inside tmux
INIT_SCRIPT="$WORKTREE_DIR/.claude-init.sh"
cat > "$INIT_SCRIPT" << EOF
#!/bin/bash
cd "$WORKTREE_DIR"
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

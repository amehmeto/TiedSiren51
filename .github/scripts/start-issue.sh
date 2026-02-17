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
# Branch name is derived by start-issue.sh based on issue title
BRANCH_NAME=""
SESSION_NAME="issue-$ISSUE_NUMBER"
WORKTREE_DIR=""

# Instructions appended to the Claude prompt
readonly CLAUDE_INSTRUCTIONS="---

## Instructions

1. Implement the issue above
2. When done, run \`/commit-push\` to commit and push your changes
   (A draft PR was already created by the worktree setup)"

# Temp files for capturing output (cleaned up on exit)
WORKTREE_STDOUT=""
WORKTREE_STDERR=""
cleanup_temp_files() {
    [ -n "$WORKTREE_STDOUT" ] && rm -f "$WORKTREE_STDOUT"
    [ -n "$WORKTREE_STDERR" ] && rm -f "$WORKTREE_STDERR"
}
trap cleanup_temp_files EXIT

# Fetch issue details from GitHub
echo "Fetching issue #$ISSUE_NUMBER..."
ISSUE_TITLE=$(gh issue view "$ISSUE_NUMBER" --json title -q '.title')
ISSUE_BODY=$(gh issue view "$ISSUE_NUMBER" --json body -q '.body')

if [ -z "$ISSUE_TITLE" ]; then
    echo "Error: Could not fetch issue #$ISSUE_NUMBER"
    exit 1
fi

echo "Issue fetched: $ISSUE_TITLE"

# Create worktree using scripts/prepare-worktree.sh (handles branch creation, PR, npm ci)
WORKTREE_SCRIPT="$REPO_ROOT/scripts/prepare-worktree.sh"
if [ ! -x "$WORKTREE_SCRIPT" ]; then
    echo "Error: prepare-worktree.sh not found or not executable at $WORKTREE_SCRIPT"
    exit 1
fi

echo "Creating worktree for issue #$ISSUE_NUMBER..."
set +e
# Capture stdout and stderr separately to avoid parsing error messages
WORKTREE_STDOUT=$(mktemp)
WORKTREE_STDERR=$(mktemp)
"$WORKTREE_SCRIPT" "$ISSUE_NUMBER" >"$WORKTREE_STDOUT" 2>"$WORKTREE_STDERR"
EXIT_CODE=$?
WORKTREE_OUTPUT=$(cat "$WORKTREE_STDOUT")
WORKTREE_ERRORS=$(cat "$WORKTREE_STDERR")
set -e

if [ $EXIT_CODE -eq 0 ]; then
    # Success - parse WORKTREE_PATH and BRANCH from stdout only (grep -m 1 for first match)
    WORKTREE_DIR=$(echo "$WORKTREE_OUTPUT" | grep -m 1 "^WORKTREE_PATH=" | cut -d= -f2)
    BRANCH_NAME=$(echo "$WORKTREE_OUTPUT" | grep -m 1 "^BRANCH=" | cut -d= -f2)
    echo "$WORKTREE_OUTPUT"
    [ -n "$WORKTREE_ERRORS" ] && echo "$WORKTREE_ERRORS" >&2
elif [ $EXIT_CODE -eq 2 ]; then
    # Worktree already exists - find it via git worktree list
    # Look for branches matching the issue number pattern: <type>/<issue_number>-* or legacy issue-<N>
    echo "Worktree already exists, finding path..."
    [ -n "$WORKTREE_OUTPUT" ] && echo "$WORKTREE_OUTPUT"
    while IFS= read -r line; do
        if [[ "$line" =~ ^worktree\ (.+)$ ]]; then
            wt_path="${BASH_REMATCH[1]}"
        elif [[ "$line" =~ ^branch\ refs/heads/(.+)$ ]]; then
            local_branch="${BASH_REMATCH[1]}"
            # Match new format: feat/42-* or fix/42-*
            # Also match legacy format: issue-42
            if [[ "$local_branch" =~ ^[a-z]+/${ISSUE_NUMBER}- ]] || \
               [[ "$local_branch" == "issue-${ISSUE_NUMBER}" ]]; then
                WORKTREE_DIR="$wt_path"
                BRANCH_NAME="$local_branch"
                break
            fi
        fi
    done < <(git worktree list --porcelain)

    if [ -n "$WORKTREE_DIR" ]; then
        echo "Found existing worktree at: $WORKTREE_DIR (branch: $BRANCH_NAME)"
        if ! (cd "$WORKTREE_DIR" && git pull --ff-only); then
            echo "Warning: git pull failed, continuing with existing state"
        fi
    fi
else
    # Non-zero exit code - show output and errors
    [ -n "$WORKTREE_OUTPUT" ] && echo "$WORKTREE_OUTPUT"
    [ -n "$WORKTREE_ERRORS" ] && echo "$WORKTREE_ERRORS" >&2
    exit $EXIT_CODE
fi

if [ -z "$WORKTREE_DIR" ]; then
    echo "Error: Could not determine worktree path"
    exit 1
fi

# Write issue content to a temp file for claude prompt
# Build file in parts to safely handle special characters in issue body
PROMPT_FILE="$WORKTREE_DIR/.claude-issue-prompt.md"
{
    # Use printf to safely handle special characters in title and body
    printf '# Issue #%s: %s\n\n' "$ISSUE_NUMBER" "$ISSUE_TITLE"
    printf '%s\n\n' "$ISSUE_BODY"
    printf '%s\n' "$CLAUDE_INSTRUCTIONS"
} > "$PROMPT_FILE"

# Create init script that will run inside tmux
# Note: npm ci is already handled by worktree.sh, so we skip it here
INIT_SCRIPT="$WORKTREE_DIR/.claude-init.sh"
cat > "$INIT_SCRIPT" << EOF
#!/bin/bash
cd "$WORKTREE_DIR"
echo "Starting Claude Code with issue #$ISSUE_NUMBER..."
# Use relative path since we cd'd to worktree dir
claude "\$(cat .claude-issue-prompt.md)"
EOF
chmod +x "$INIT_SCRIPT"

# Start tmux session
echo "Starting tmux session: $SESSION_NAME"
tmux new-session -d -s "$SESSION_NAME" -c "$WORKTREE_DIR"
tmux send-keys -t "$SESSION_NAME" "$INIT_SCRIPT" Enter

echo ""
echo "Done! Attach to the session with:"
echo "  tmux attach -t $SESSION_NAME"

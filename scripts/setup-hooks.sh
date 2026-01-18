#!/usr/bin/env bash
set -euo pipefail

# Setup script for git hooks
# Creates reference-transaction and post-push hooks for CI monitoring

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly SCRIPT_DIR
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
readonly REPO_ROOT
readonly HOOKS_DIR="$REPO_ROOT/.git/hooks"

# Source shared colors
# shellcheck source=/dev/null
source "$SCRIPT_DIR/lib/colors.sh"

# Verify we're inside a git repository
if ! git rev-parse --git-dir &>/dev/null; then
  print_error "Not inside a git repository"
  exit 1
fi

# Check for required dependencies
if ! command -v gh &>/dev/null; then
  print_error "GitHub CLI (gh) is required but not installed"
  echo "Install it from: https://cli.github.com/"
  exit 1
fi

# Ensure hooks directory exists
mkdir -p "$HOOKS_DIR"

# Create reference-transaction hook
create_reference_transaction_hook() {
  local hook_path="$HOOKS_DIR/reference-transaction"

  if [[ -f "$hook_path" ]]; then
    print_warning "reference-transaction hook already exists, backing up to $hook_path.bak"
    cp "$hook_path" "$hook_path.bak"
  fi

  cat > "$hook_path" << 'EOF'
#!/usr/bin/env bash
set -euo pipefail
# Detect pushed branch from the ref being updated, not from current HEAD
# This correctly handles: git push origin feature-x (while on main)
# CI_WATCH_REMOTE: configurable remote name (default: origin)
remote="${CI_WATCH_REMOTE:-origin}"
while read -r oldvalue newvalue refname; do
  if [[ "$1" == "committed" ]] && [[ "$refname" == "refs/remotes/$remote/"* ]]; then
    # Extract branch name from refs/remotes/<remote>/<branch>
    pushed_branch="${refname#refs/remotes/$remote/}"
    if [[ -x "$(dirname "$0")/post-push" ]]; then
      # Run in background and detach from terminal to survive session close
      PUSHED_BRANCH="$pushed_branch" PUSHED_SHA="$newvalue" "$(dirname "$0")/post-push" &
      disown
    fi
    break
  fi
done
EOF
  chmod +x "$hook_path"
  print_success "Created reference-transaction hook"
}

# Create post-push hook
create_post_push_hook() {
  local hook_path="$HOOKS_DIR/post-push"

  if [[ -f "$hook_path" ]]; then
    print_warning "post-push hook already exists, backing up to $hook_path.bak"
    cp "$hook_path" "$hook_path.bak"
  fi

  cat > "$hook_path" << 'EOF'
#!/usr/bin/env bash
set -euo pipefail
# PUSHED_BRANCH and PUSHED_SHA are set by reference-transaction hook
# SKIP_CI_WATCH: set to skip CI monitoring

if [[ -n "${SKIP_CI_WATCH:-}" ]]; then
  exit 0
fi

echo "Push completed! Now watching CI... (Ctrl+C to cancel)"
REPO_ROOT="$(git rev-parse --show-toplevel)"
if [[ -x "$REPO_ROOT/scripts/ci-watch.sh" ]]; then
  "$REPO_ROOT/scripts/ci-watch.sh"
else
  echo ""
  echo "=========================================="
  echo "[ERROR] ci-watch.sh not found or not executable!"
  echo "=========================================="
  echo "Expected location: $REPO_ROOT/scripts/ci-watch.sh"
  echo ""
  echo "To fix this, either:"
  echo "  1. Ensure scripts/ci-watch.sh exists and is executable"
  echo "  2. Run: chmod +x $REPO_ROOT/scripts/ci-watch.sh"
  echo "  3. Or remove hooks: rm .git/hooks/reference-transaction .git/hooks/post-push"
  echo ""
  exit 1
fi
EOF
  chmod +x "$hook_path"
  print_success "Created post-push hook"
}

main() {
  echo "Setting up git hooks for CI monitoring..."
  echo ""
  create_reference_transaction_hook
  create_post_push_hook
  echo ""
  echo "Git hooks installed successfully!"
  echo "After pushing, CI status will be monitored automatically."
}

main "$@"

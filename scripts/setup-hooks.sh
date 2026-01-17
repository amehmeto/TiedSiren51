#!/usr/bin/env bash
set -euo pipefail

# Setup script for git hooks
# Creates reference-transaction and post-push hooks for CI monitoring

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly SCRIPT_DIR
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
readonly REPO_ROOT
readonly HOOKS_DIR="$REPO_ROOT/.git/hooks"

# Colors for output
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m'

print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }

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
current_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
if [[ -z "$current_branch" || "$current_branch" == "HEAD" ]]; then
  exit 0
fi
while read -r oldvalue newvalue refname; do
  if [[ "$1" == "committed" ]] && [[ "$refname" == "refs/remotes/origin/$current_branch" ]]; then
    if [[ -x "$(dirname "$0")/post-push" ]]; then
      "$(dirname "$0")/post-push"
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
echo "Push completed! Now watching CI..."
REPO_ROOT="$(git rev-parse --show-toplevel)"
if [[ -x "$REPO_ROOT/scripts/ci-watch.sh" ]]; then
  "$REPO_ROOT/scripts/ci-watch.sh"
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

#!/usr/bin/env bash
set -e

# Script to manage git worktrees with automatic cleanup and PR creation
# Usage:
#   ./scripts/worktree.sh <branch-name>     Create worktree for new/existing branch
#   ./scripts/worktree.sh <pr-number>       Create worktree for existing PR
#   ./scripts/worktree.sh --list            List all worktrees with PR status
#   ./scripts/worktree.sh --prune           Only cleanup merged PR worktrees
#   ./scripts/worktree.sh --remove <name>   Remove specific worktree

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKTREES_DIR="$(dirname "$REPO_ROOT")/worktrees"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Cleanup worktrees with merged/closed PRs
cleanup_merged_worktrees() {
  print_info "Checking for worktrees with merged/closed PRs..."

  local cleaned=0

  while IFS= read -r line; do
    local wt_path branch
    wt_path=$(echo "$line" | awk '{print $1}')
    branch=$(echo "$line" | awk '{print $3}' | tr -d '[]')

    # Skip main worktree and detached HEAD
    if [ "$wt_path" = "$REPO_ROOT" ] || [ -z "$branch" ] || [ "$branch" = "detached" ]; then
      continue
    fi

    # Check if there's a PR for this branch
    local pr_info
    pr_info=$(gh pr list --head "$branch" --json number,state --jq '.[0] // empty' 2>/dev/null || true)

    if [ -n "$pr_info" ]; then
      local pr_state pr_number
      pr_state=$(echo "$pr_info" | jq -r '.state')
      pr_number=$(echo "$pr_info" | jq -r '.number')

      if [ "$pr_state" = "MERGED" ] || [ "$pr_state" = "CLOSED" ]; then
        print_warning "Found $pr_state PR #$pr_number for worktree at $wt_path, removing..."
        git worktree remove "$wt_path" --force 2>/dev/null || true
        git branch -D "$branch" 2>/dev/null || true
        ((cleaned++))
      fi
    fi
  done < <(git worktree list)

  git worktree prune 2>/dev/null || true

  if [ "$cleaned" -gt 0 ]; then
    print_success "Cleaned up $cleaned worktree(s) with merged/closed PRs"
  else
    print_info "No worktrees with merged/closed PRs found"
  fi
}

# List all worktrees with PR status
list_worktrees() {
  print_info "Listing all worktrees with PR status...\n"

  printf "%-50s %-30s %-8s %-10s %s\n" "PATH" "BRANCH" "PR #" "STATUS" "TITLE"
  printf "%-50s %-30s %-8s %-10s %s\n" "----" "------" "----" "------" "-----"

  while IFS= read -r line; do
    local wt_path branch
    wt_path=$(echo "$line" | awk '{print $1}')
    branch=$(echo "$line" | awk '{print $3}' | tr -d '[]')

    if [ -z "$branch" ] || [ "$branch" = "detached" ]; then
      branch="(detached)"
    fi

    local pr_number="-" pr_state="-" pr_title="-"

    if [ "$branch" != "(detached)" ] && [ "$branch" != "main" ]; then
      local pr_info
      pr_info=$(gh pr list --head "$branch" --json number,state,title --jq '.[0] // empty' 2>/dev/null || true)

      if [ -n "$pr_info" ]; then
        pr_number=$(echo "$pr_info" | jq -r '.number')
        pr_state=$(echo "$pr_info" | jq -r '.state')
        pr_title=$(echo "$pr_info" | jq -r '.title' | cut -c1-40)
      fi
    fi

    # Shorten path for display
    local short_path
    short_path="${wt_path/$HOME/\~}"

    printf "%-50s %-30s %-8s %-10s %s\n" "$short_path" "$branch" "$pr_number" "$pr_state" "$pr_title"
  done < <(git worktree list)

  echo ""
}

# Remove a specific worktree
remove_worktree() {
  local name="$1"

  if [ -z "$name" ]; then
    print_error "Please provide the worktree name to remove"
    exit 1
  fi

  # Find worktree by name (partial match)
  local wt_path branch
  while IFS= read -r line; do
    local path
    path=$(echo "$line" | awk '{print $1}')
    if [[ "$path" == *"$name"* ]]; then
      wt_path="$path"
      branch=$(echo "$line" | awk '{print $3}' | tr -d '[]')
      break
    fi
  done < <(git worktree list)

  if [ -z "$wt_path" ]; then
    print_error "Worktree matching '$name' not found"
    exit 1
  fi

  # Safety check: only allow removal if PR is merged or closed
  if [ -n "$branch" ] && [ "$branch" != "detached" ] && [ "$branch" != "main" ]; then
    local pr_info
    pr_info=$(gh pr list --head "$branch" --json number,state --jq '.[0] // empty' 2>/dev/null || true)

    if [ -n "$pr_info" ]; then
      local pr_state pr_number
      pr_state=$(echo "$pr_info" | jq -r '.state')
      pr_number=$(echo "$pr_info" | jq -r '.number')

      if [ "$pr_state" = "OPEN" ]; then
        print_error "Cannot remove worktree: PR #$pr_number is still OPEN"
        print_info "Merge or close the PR first, or use 'gh pr close $pr_number' to close it"
        exit 1
      fi

      print_info "PR #$pr_number is $pr_state, safe to remove"
    else
      print_warning "No PR found for branch '$branch', allowing removal"
    fi
  fi

  print_info "Removing worktree at $wt_path (branch: $branch)..."
  git worktree remove "$wt_path" --force

  if [ -n "$branch" ] && [ "$branch" != "detached" ]; then
    git branch -D "$branch" 2>/dev/null || true
    print_success "Removed worktree and deleted local branch '$branch'"
  else
    print_success "Removed worktree"
  fi
}

# Sanitize branch name for directory name
sanitize_for_dirname() {
  echo "$1" | tr '/' '-'
}

# Create worktree from PR number
create_from_pr() {
  local pr_number="$1"

  print_info "Fetching PR #$pr_number details..."

  local pr_info
  pr_info=$(gh pr view "$pr_number" --json headRefName,number 2>/dev/null)

  if [ -z "$pr_info" ]; then
    print_error "PR #$pr_number not found"
    exit 1
  fi

  local branch
  branch=$(echo "$pr_info" | jq -r '.headRefName')
  local sanitized_branch
  sanitized_branch=$(sanitize_for_dirname "$branch")
  local wt_name="PR${pr_number}-${sanitized_branch}"
  local wt_path="$WORKTREES_DIR/$wt_name"

  print_info "Creating worktree for PR #$pr_number (branch: $branch)..."

  git fetch origin "$branch"
  mkdir -p "$WORKTREES_DIR"
  git worktree add "$wt_path" "$branch"

  print_info "Installing dependencies..."
  (cd "$wt_path" && npm ci)

  print_success "Worktree created at: $wt_path"
  print_info "To navigate: cd $wt_path"

  # No PR creation needed - PR already exists
}

# Create worktree from branch name
create_from_branch() {
  local branch="$1"
  local sanitized_branch
  sanitized_branch=$(sanitize_for_dirname "$branch")

  mkdir -p "$WORKTREES_DIR"

  # Check if branch exists locally or remotely
  local branch_exists=false
  if git show-ref --verify --quiet "refs/heads/$branch" 2>/dev/null; then
    branch_exists=true
    print_info "Branch '$branch' exists locally"
  elif git ls-remote --exit-code --heads origin "$branch" >/dev/null 2>&1; then
    branch_exists=true
    print_info "Branch '$branch' exists on remote, fetching..."
    git fetch origin "$branch"
  fi

  # Check if PR exists for this branch
  local existing_pr
  existing_pr=$(gh pr list --head "$branch" --json number --jq '.[0].number // empty' 2>/dev/null || true)

  local wt_name
  local wt_path

  if [ -n "$existing_pr" ]; then
    # PR exists, use PR number in name
    wt_name="PR${existing_pr}-${sanitized_branch}"
    wt_path="$WORKTREES_DIR/$wt_name"
    print_info "PR #$existing_pr already exists for this branch"

    # Check if worktree already exists
    if [ -d "$wt_path" ]; then
      print_error "Worktree already exists at $wt_path"
      exit 1
    fi

    if [ "$branch_exists" = true ]; then
      print_info "Creating worktree with existing branch '$branch'..."
      git worktree add "$wt_path" "$branch"
    else
      print_error "Branch '$branch' doesn't exist but PR #$existing_pr references it"
      exit 1
    fi

    print_info "Installing dependencies..."
    (cd "$wt_path" && npm ci)
  else
    # No PR yet - create branch, push, create PR, then create worktree with PR number
    if [ "$branch_exists" = false ]; then
      print_info "Creating new branch '$branch' from main..."
      git fetch origin main
      git branch "$branch" origin/main
    fi

    print_info "Pushing branch to origin..."
    SKIP_E2E_CHECK=true git push -u origin "$branch" 2>/dev/null || true

    print_info "Creating draft PR..."

    # Determine PR title from branch name
    local pr_title
    pr_title=$(echo "$branch" | sed 's|^feat/|feat: |; s|^fix/|fix: |; s|^refactor/|refactor: |; s|^docs/|docs: |; s|^chore/|chore: |; s|-| |g')

    local pr_url
    pr_url=$(gh pr create --draft --head "$branch" --title "$pr_title" --body "$(cat <<'PREOF'
## Summary

<!-- Brief description of what this PR does and why -->

## Changes

- [ ] TODO: List changes made

## Related Issues

<!-- Link related issues: Closes #123, Fixes #456, Related to #789 -->

## Test plan

- [ ] Unit tests pass (`npm test`)
- [ ] Lint passes (`npm run lint`)
- [ ] Manual testing completed

## Screenshots (if applicable)

<!-- Add screenshots for UI changes -->

---
Generated with [Claude Code](https://claude.com/claude-code)
PREOF
)")

    print_success "Draft PR created: $pr_url"

    # Get the PR number from the newly created PR
    local new_pr_number
    new_pr_number=$(gh pr list --head "$branch" --json number --jq '.[0].number' 2>/dev/null)

    wt_name="PR${new_pr_number}-${sanitized_branch}"
    wt_path="$WORKTREES_DIR/$wt_name"

    # Check if worktree already exists
    if [ -d "$wt_path" ]; then
      print_error "Worktree already exists at $wt_path"
      exit 1
    fi

    print_info "Creating worktree with branch '$branch'..."
    git worktree add "$wt_path" "$branch"

    print_info "Installing dependencies..."
    (cd "$wt_path" && npm ci)
  fi

  print_success "Worktree created at: $wt_path"
  print_info "To navigate: cd $wt_path"
}

# Main script
main() {
  cd "$REPO_ROOT"

  # Parse arguments
  case "${1:-}" in
    --list|-l)
      list_worktrees
      exit 0
      ;;
    --prune|-p)
      cleanup_merged_worktrees
      exit 0
      ;;
    --remove|-r)
      remove_worktree "$2"
      exit 0
      ;;
    --help|-h|"")
      echo "Usage: $0 <branch-name|pr-number|option>"
      echo ""
      echo "Options:"
      echo "  <branch-name>       Create worktree for branch (creates if doesn't exist)"
      echo "  <pr-number>         Create worktree for existing PR"
      echo "  --list, -l          List all worktrees with PR status"
      echo "  --prune, -p         Cleanup worktrees with merged/closed PRs"
      echo "  --remove, -r <name> Remove specific worktree"
      echo "  --help, -h          Show this help message"
      echo ""
      echo "Examples:"
      echo "  $0 feat/my-feature  # Create worktree for new feature branch"
      echo "  $0 42               # Create worktree for PR #42"
      echo "  $0 --list           # Show all worktrees"
      echo "  $0 --prune          # Cleanup merged worktrees"
      echo "  $0 --remove feat    # Remove worktree matching 'feat'"
      exit 0
      ;;
    *)
      # Cleanup first (unless just listing)
      cleanup_merged_worktrees
      echo ""

      # Determine if argument is PR number or branch name
      if [[ "$1" =~ ^[0-9]+$ ]]; then
        create_from_pr "$1"
      else
        create_from_branch "$1"
      fi
      ;;
  esac
}

main "$@"

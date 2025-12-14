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

# Exit codes
readonly EXIT_SUCCESS=0
readonly EXIT_INVALID_ARGS=1
readonly EXIT_WORKTREE_EXISTS=2
readonly EXIT_WORKTREE_NOT_FOUND=3
readonly EXIT_PR_STILL_OPEN=4
readonly EXIT_BRANCH_NOT_FOUND=5
readonly EXIT_PR_CREATE_FAILED=6
readonly EXIT_NPM_CI_FAILED=7
readonly EXIT_GIT_FAILED=8

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check required dependencies
check_dependencies() {
  local missing=()
  if ! command -v gh &>/dev/null; then
    missing+=("gh (GitHub CLI)")
  fi
  if ! command -v jq &>/dev/null; then
    missing+=("jq")
  fi
  if [ ${#missing[@]} -gt 0 ]; then
    echo -e "${RED}[ERROR]${NC} Missing required dependencies: ${missing[*]}" >&2
    echo "Install them with: brew install gh jq" >&2
    exit "$EXIT_INVALID_ARGS"
  fi
}

print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Parse git worktree list --porcelain output
# Outputs: path<TAB>branch for each worktree (branch is empty for detached HEAD)
parse_worktree_list() {
  local wt_path="" branch=""
  while IFS= read -r line || [ -n "$line" ]; do
    if [[ "$line" =~ ^worktree\ (.+)$ ]]; then
      wt_path="${BASH_REMATCH[1]}"
    elif [[ "$line" =~ ^branch\ refs/heads/(.+)$ ]]; then
      branch="${BASH_REMATCH[1]}"
    elif [[ "$line" == "detached" ]]; then
      branch=""
    elif [ -z "$line" ] && [ -n "$wt_path" ]; then
      printf '%s\t%s\n' "$wt_path" "$branch"
      wt_path=""
      branch=""
    fi
  done < <(git worktree list --porcelain; echo)
}

# Print summary block for Claude Code parsing
print_summary() {
  local wt_path="$1"
  local branch="$2"
  local pr_number="$3"
  local pr_url="$4"

  echo ""
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${CYAN}SUMMARY${NC}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo "WORKTREE_PATH=$wt_path"
  echo "BRANCH=$branch"
  echo "PR_NUMBER=${pr_number:-none}"
  echo "PR_URL=${pr_url:-none}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Cleanup worktrees with merged/closed PRs
cleanup_merged_worktrees() {
  print_info "Checking for worktrees with merged/closed PRs..."

  local cleaned=0

  while IFS=$'\t' read -r wt_path branch; do
    # Skip main worktree and detached HEAD
    if [ "$wt_path" = "$REPO_ROOT" ] || [ -z "$branch" ]; then
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
        ((cleaned++)) || true
      fi
    fi
  done < <(parse_worktree_list)

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

  while IFS=$'\t' read -r wt_path branch; do
    local display_branch="$branch"
    if [ -z "$branch" ]; then
      display_branch="(detached)"
    fi

    local pr_number="-" pr_state="-" pr_title="-"

    if [ -n "$branch" ] && [ "$branch" != "main" ]; then
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

    printf "%-50s %-30s %-8s %-10s %s\n" "$short_path" "$display_branch" "$pr_number" "$pr_state" "$pr_title"
  done < <(parse_worktree_list)

  echo ""
}

# Remove a specific worktree
remove_worktree() {
  local name="$1"

  if [ -z "$name" ]; then
    print_error "Please provide the worktree name to remove"
    exit "$EXIT_INVALID_ARGS"
  fi

  # Find worktree by name (partial match)
  local wt_path="" branch=""
  while IFS=$'\t' read -r path br; do
    if [[ "$path" == *"$name"* ]]; then
      wt_path="$path"
      branch="$br"
      break
    fi
  done < <(parse_worktree_list)

  if [ -z "$wt_path" ]; then
    print_error "Worktree matching '$name' not found"
    exit "$EXIT_WORKTREE_NOT_FOUND"
  fi

  # Safety check: only allow removal if PR is merged or closed
  if [ -n "$branch" ] && [ "$branch" != "main" ]; then
    local pr_info
    pr_info=$(gh pr list --head "$branch" --json number,state --jq '.[0] // empty' 2>/dev/null || true)

    if [ -n "$pr_info" ]; then
      local pr_state pr_number
      pr_state=$(echo "$pr_info" | jq -r '.state')
      pr_number=$(echo "$pr_info" | jq -r '.number')

      if [ "$pr_state" = "OPEN" ]; then
        print_error "Cannot remove worktree: PR #$pr_number is still OPEN"
        print_info "Merge or close the PR first, or use 'gh pr close $pr_number' to close it"
        exit "$EXIT_PR_STILL_OPEN"
      fi

      print_info "PR #$pr_number is $pr_state, safe to remove"
    else
      print_warning "No PR found for branch '$branch', allowing removal"
    fi
  fi

  print_info "Removing worktree at $wt_path (branch: $branch)..."
  if ! git worktree remove "$wt_path" --force; then
    print_error "Failed to remove worktree"
    exit "$EXIT_GIT_FAILED"
  fi

  if [ -n "$branch" ]; then
    git branch -D "$branch" 2>/dev/null || true
    print_success "Removed worktree and deleted local branch '$branch'"
  else
    print_success "Removed worktree"
  fi
}

# Sanitize branch name for directory name
# Handles: / : * ? " < > | @ { } and spaces
sanitize_for_dirname() {
  echo "$1" | tr '/:*?"<>|@{} ' '-' | sed 's/--*/-/g; s/^-//; s/-$//'
}

# Create worktree from PR number
create_from_pr() {
  local pr_number="$1"

  print_info "Fetching PR #$pr_number details..."

  local pr_info pr_url
  pr_info=$(gh pr view "$pr_number" --json headRefName,number,url 2>/dev/null)

  if [ -z "$pr_info" ]; then
    print_error "PR #$pr_number not found"
    exit "$EXIT_BRANCH_NOT_FOUND"
  fi

  local branch
  branch=$(echo "$pr_info" | jq -r '.headRefName')
  pr_url=$(echo "$pr_info" | jq -r '.url')
  local sanitized_branch
  sanitized_branch=$(sanitize_for_dirname "$branch")
  local wt_name="PR${pr_number}-${sanitized_branch}"
  local wt_path="$WORKTREES_DIR/$wt_name"

  # Check if worktree already exists
  if [ -d "$wt_path" ]; then
    print_error "Worktree already exists at $wt_path"
    exit "$EXIT_WORKTREE_EXISTS"
  fi

  print_info "Creating worktree for PR #$pr_number (branch: $branch)..."

  if ! git fetch origin "$branch"; then
    print_error "Failed to fetch branch '$branch'"
    exit "$EXIT_GIT_FAILED"
  fi

  mkdir -p "$WORKTREES_DIR"

  if ! git worktree add "$wt_path" "$branch"; then
    print_error "Failed to create worktree"
    exit "$EXIT_GIT_FAILED"
  fi

  print_info "Installing dependencies..."
  if ! (cd "$wt_path" && npm ci); then
    print_error "Failed to install dependencies"
    exit "$EXIT_NPM_CI_FAILED"
  fi

  print_success "Worktree created at: $wt_path"
  print_info "To navigate: cd $wt_path"

  print_summary "$wt_path" "$branch" "$pr_number" "$pr_url"
  exit "$EXIT_SUCCESS"
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
  local existing_pr_info existing_pr existing_pr_url
  existing_pr_info=$(gh pr list --head "$branch" --json number,url --jq '.[0] // empty' 2>/dev/null || true)
  if [ -n "$existing_pr_info" ]; then
    existing_pr=$(echo "$existing_pr_info" | jq -r '.number')
    existing_pr_url=$(echo "$existing_pr_info" | jq -r '.url')
  fi

  local wt_name
  local wt_path
  local pr_number
  local pr_url

  if [ -n "$existing_pr" ]; then
    # PR exists, use PR number in name
    pr_number="$existing_pr"
    pr_url="$existing_pr_url"
    wt_name="PR${existing_pr}-${sanitized_branch}"
    wt_path="$WORKTREES_DIR/$wt_name"
    print_info "PR #$existing_pr already exists for this branch"

    # Check if worktree already exists
    if [ -d "$wt_path" ]; then
      print_error "Worktree already exists at $wt_path"
      exit "$EXIT_WORKTREE_EXISTS"
    fi

    if [ "$branch_exists" = true ]; then
      print_info "Creating worktree with existing branch '$branch'..."
      if ! git worktree add "$wt_path" "$branch"; then
        print_error "Failed to create worktree"
        exit "$EXIT_GIT_FAILED"
      fi
    else
      print_error "Branch '$branch' doesn't exist but PR #$existing_pr references it"
      exit "$EXIT_BRANCH_NOT_FOUND"
    fi

    print_info "Installing dependencies..."
    if ! (cd "$wt_path" && npm ci); then
      print_error "Failed to install dependencies"
      exit "$EXIT_NPM_CI_FAILED"
    fi
  else
    # No PR yet - create branch, push, create PR, then create worktree with PR number
    if [ "$branch_exists" = false ]; then
      print_info "Creating new branch '$branch' from main..."
      git fetch origin main
      if ! git branch "$branch" origin/main; then
        print_error "Failed to create branch"
        exit "$EXIT_GIT_FAILED"
      fi
    fi

    print_info "Pushing branch to origin..."
    if ! SKIP_E2E_CHECK=true git push -u origin "$branch"; then
      print_error "Failed to push branch to origin"
      exit "$EXIT_GIT_FAILED"
    fi

    print_info "Creating draft PR..."

    # Determine PR title from branch name
    local pr_title
    pr_title=$(echo "$branch" | sed 's|^feat/|feat: |; s|^fix/|fix: |; s|^refactor/|refactor: |; s|^docs/|docs: |; s|^chore/|chore: |; s|-| |g')

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

    if [ -z "$pr_url" ]; then
      print_error "Failed to create PR"
      exit "$EXIT_PR_CREATE_FAILED"
    fi

    print_success "Draft PR created: $pr_url"

    # Get the PR number from the newly created PR
    pr_number=$(gh pr list --head "$branch" --json number --jq '.[0].number' 2>/dev/null)

    wt_name="PR${pr_number}-${sanitized_branch}"
    wt_path="$WORKTREES_DIR/$wt_name"

    # Check if worktree already exists
    if [ -d "$wt_path" ]; then
      print_error "Worktree already exists at $wt_path"
      exit "$EXIT_WORKTREE_EXISTS"
    fi

    print_info "Creating worktree with branch '$branch'..."
    if ! git worktree add "$wt_path" "$branch"; then
      print_error "Failed to create worktree"
      exit "$EXIT_GIT_FAILED"
    fi

    print_info "Installing dependencies..."
    if ! (cd "$wt_path" && npm ci); then
      print_error "Failed to install dependencies"
      exit "$EXIT_NPM_CI_FAILED"
    fi
  fi

  print_success "Worktree created at: $wt_path"
  print_info "To navigate: cd $wt_path"

  print_summary "$wt_path" "$branch" "$pr_number" "$pr_url"
  exit "$EXIT_SUCCESS"
}

# Main script
main() {
  cd "$REPO_ROOT"
  check_dependencies

  # Parse arguments
  case "${1:-}" in
    --list|-l)
      list_worktrees
      exit "$EXIT_SUCCESS"
      ;;
    --prune|-p)
      cleanup_merged_worktrees
      exit "$EXIT_SUCCESS"
      ;;
    --remove|-r)
      remove_worktree "$2"
      exit "$EXIT_SUCCESS"
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
      echo "Exit codes:"
      echo "  0 - Success"
      echo "  1 - Invalid arguments"
      echo "  2 - Worktree already exists"
      echo "  3 - Worktree not found"
      echo "  4 - PR still open (cannot remove)"
      echo "  5 - Branch not found"
      echo "  6 - PR creation failed"
      echo "  7 - npm ci failed"
      echo "  8 - Git operation failed"
      echo ""
      echo "Examples:"
      echo "  $0 feat/my-feature  # Create worktree for new feature branch"
      echo "  $0 42               # Create worktree for PR #42"
      echo "  $0 --list           # Show all worktrees"
      echo "  $0 --prune          # Cleanup merged worktrees"
      echo "  $0 --remove feat    # Remove worktree matching 'feat'"
      exit "$EXIT_SUCCESS"
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

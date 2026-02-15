#!/usr/bin/env bash
set -e

# Script to start work on a GitHub issue with automatic worktree, branch, and PR creation
# Works from any worktree context — resolves the main repo automatically.
#
# Usage:
#   ./scripts/start-issue.sh <issue-number>  Create worktree for issue (derives branch name)
#   ./scripts/start-issue.sh --list          List all worktrees with PR status
#   ./scripts/start-issue.sh --prune         Only cleanup merged PR worktrees
#   ./scripts/start-issue.sh --remove <name> Remove specific worktree

# Resolve main repo root from any worktree context.
# Uses git's common-dir to follow .git pointers back to the real repo.
resolve_main_repo() {
  local git_common_dir
  git_common_dir=$(git rev-parse --git-common-dir 2>/dev/null) || {
    echo "ERROR: Not inside a git repository" >&2
    return 1
  }
  # git-common-dir returns the shared .git directory (e.g. /path/to/Repo/.git)
  # We need the parent (the actual repo root)
  local resolved
  resolved=$(cd "$git_common_dir" && cd .. && pwd)
  echo "$resolved"
}

MAIN_REPO="$(resolve_main_repo)"
if [ -z "$MAIN_REPO" ]; then
  echo "ERROR: Could not resolve main repository root" >&2
  exit 1
fi
WORKTREES_DIR="$(cd "$MAIN_REPO/.." && pwd)/worktrees"

# Load shared branch naming configuration
# shellcheck disable=SC1091 # Path is dynamic but verified at runtime
source "$(dirname "${BASH_SOURCE[0]}")/lib/branch-config.sh"

# Wrapper for git commands that need the main repo context.
# Disables hooks (husky breaks in worktree context) and operates on MAIN_REPO.
mgit() {
  git -C "$MAIN_REPO" -c core.hooksPath=/dev/null "$@"
}

# Exit codes
readonly EXIT_SUCCESS=0
readonly EXIT_INVALID_ARGS=1
readonly EXIT_WORKTREE_EXISTS=2
readonly EXIT_WORKTREE_NOT_FOUND=3
readonly EXIT_PR_STILL_OPEN=4
readonly EXIT_ISSUE_NOT_FOUND=5
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

# Parse type prefix from issue title
# Returns: feat, fix, refactor, docs, chore, test, perf (defaults to feat)
parse_type_from_title() {
  local title="$1"
  local lower_title
  lower_title=$(echo "$title" | tr '[:upper:]' '[:lower:]')

  local prefix
  for prefix in $TYPE_PREFIXES; do
    if [[ "$lower_title" =~ ^$prefix ]]; then
      echo "$prefix"
      return
    fi
  done
  echo "feat"
}

# Check if title has a conventional commit prefix (case-insensitive)
has_type_prefix() {
  local title="$1"
  local lower_title
  lower_title=$(echo "$title" | tr '[:upper:]' '[:lower:]')

  local prefix pattern
  for prefix in $TYPE_PREFIXES; do
    pattern="^${prefix}[:(]"
    if [[ "$lower_title" =~ $pattern ]]; then
      return 0
    fi
  done
  return 1
}

# Slugify title for branch name
# Removes type prefix, lowercases, replaces special chars with dashes
# Truncates at word boundary to max 50 chars
slugify_title() {
  local title="$1"
  local slug
  slug=$(echo "$title" \
    | sed -E 's/^[a-zA-Z]+(\([^)]*\))?[!]?:[ ]*//' \
    | tr '[:upper:]' '[:lower:]' \
    | tr -cs 'a-z0-9' '-' \
    | sed 's/^-//;s/-$//')

  # Fallback for empty slug (e.g., unicode-only titles)
  if [ -z "$slug" ]; then
    slug="issue"
  fi

  # Truncate at word boundary (last dash before 50 chars)
  if [ ${#slug} -gt 50 ]; then
    slug="${slug:0:50}"
    # If we're in the middle of a word, cut back to last dash
    if [[ "$slug" =~ -[^-]+$ ]] && [[ ! "${slug: -1}" == "-" ]]; then
      slug="${slug%-*}"
    fi
    # Remove trailing dash if present
    slug="${slug%-}"
  fi
  echo "$slug"
}

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
  done < <(mgit worktree list --porcelain; echo)
}

# Validate .git pointers in existing worktrees
# Warns about broken worktrees that need manual repair
check_worktree_health() {
  local unhealthy=0

  while IFS=$'\t' read -r wt_path branch; do
    # Skip main worktree
    if [ "$wt_path" = "$MAIN_REPO" ]; then
      continue
    fi

    if [ ! -e "$wt_path" ]; then
      print_warning "Worktree path does not exist: $wt_path (branch: ${branch:-detached})"
      ((unhealthy++)) || true
      continue
    fi

    if [ ! -f "$wt_path/.git" ]; then
      print_warning "Missing .git pointer in worktree: $wt_path (branch: ${branch:-detached})"
      print_info "  Run 'git worktree repair' to attempt automatic repair"
      ((unhealthy++)) || true
      continue
    fi

    # Verify .git file content points to a valid directory
    local gitdir_line
    gitdir_line=$(head -1 "$wt_path/.git" 2>/dev/null) || true
    if [[ "$gitdir_line" =~ ^gitdir:\ (.+)$ ]]; then
      local gitdir="${BASH_REMATCH[1]}"
      # Resolve relative paths
      if [[ "$gitdir" != /* ]]; then
        gitdir="$wt_path/$gitdir"
      fi
      if [ ! -d "$gitdir" ]; then
        print_warning "Broken .git pointer in worktree: $wt_path"
        print_info "  Points to non-existent directory: $gitdir"
        print_info "  Run 'git worktree repair' to attempt automatic repair"
        ((unhealthy++)) || true
      fi
    else
      print_warning "Invalid .git file in worktree: $wt_path"
      ((unhealthy++)) || true
    fi
  done < <(parse_worktree_list)

  if [ "$unhealthy" -gt 0 ]; then
    print_warning "$unhealthy worktree(s) have issues. Consider running: git worktree repair"
    echo ""
  fi
}

# Print summary block for Claude Code parsing
print_summary() {
  local wt_path="$1"
  local branch="$2"
  local pr_number="$3"
  local pr_url="$4"
  local issue_number="$5"

  echo ""
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${CYAN}SUMMARY${NC}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo "WORKTREE_PATH=$wt_path"
  echo "BRANCH=$branch"
  echo "PR_NUMBER=${pr_number:-none}"
  echo "PR_URL=${pr_url:-none}"
  echo "ISSUE_CONTENT_START"
  if ! gh issue view "$issue_number" --comments; then
    echo "[ERROR] Failed to fetch issue #$issue_number content"
  fi
  echo "ISSUE_CONTENT_END"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Cleanup worktrees with merged/closed PRs
cleanup_merged_worktrees() {
  print_info "Checking for worktrees with merged/closed PRs..."

  local cleaned=0

  while IFS=$'\t' read -r wt_path branch; do
    # Skip main worktree and detached HEAD
    if [ "$wt_path" = "$MAIN_REPO" ] || [ -z "$branch" ]; then
      continue
    fi

    # Check if there's a PR for this branch (must use --state all to find merged/closed PRs)
    local pr_info
    pr_info=$(gh pr list --head "$branch" --state all --json number,state --jq '.[0] // empty') || {
      print_warning "Failed to check PR status for branch '$branch', skipping"
      continue
    }

    if [ -n "$pr_info" ]; then
      local pr_state pr_number
      pr_state=$(echo "$pr_info" | jq -r '.state')
      pr_number=$(echo "$pr_info" | jq -r '.number')

      if [ "$pr_state" = "MERGED" ] || [ "$pr_state" = "CLOSED" ]; then
        print_warning "Found $pr_state PR #$pr_number for worktree at $wt_path, removing..."
        mgit worktree remove "$wt_path" --force 2>/dev/null || true
        mgit branch -D "$branch" 2>/dev/null || true
        ((cleaned++)) || true
      fi
    fi
  done < <(parse_worktree_list)

  mgit worktree prune 2>/dev/null || true

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
      # Use --state all to show merged/closed PRs too
      pr_info=$(gh pr list --head "$branch" --state all --json number,state,title --jq '.[0] // empty') || true

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
    # Use --state all to find merged/closed PRs too
    if ! pr_info=$(gh pr list --head "$branch" --state all --json number,state --jq '.[0] // empty'); then
      print_error "Failed to check PR status for branch '$branch' (gh CLI error)"
      exit "$EXIT_GIT_FAILED"
    fi

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
  if ! mgit worktree remove "$wt_path" --force; then
    print_error "Failed to remove worktree"
    exit "$EXIT_GIT_FAILED"
  fi

  if [ -n "$branch" ]; then
    mgit branch -D "$branch" 2>/dev/null || true
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

# Create worktree from issue number
create_from_issue() {
  local issue_number="$1"

  # Fetch latest from origin (no checkout needed — we branch from origin/main)
  print_info "Fetching latest from origin..."
  if ! mgit fetch origin main; then
    print_error "Failed to fetch latest main from origin"
    exit "$EXIT_GIT_FAILED"
  fi

  print_info "Fetching issue #$issue_number details..."

  local issue_info
  if ! issue_info=$(gh issue view "$issue_number" --json title,body,labels); then
    print_error "Failed to fetch issue #$issue_number"
    exit "$EXIT_ISSUE_NOT_FOUND"
  fi

  if [ -z "$issue_info" ]; then
    print_error "Issue #$issue_number not found"
    exit "$EXIT_ISSUE_NOT_FOUND"
  fi

  local issue_title
  issue_title=$(echo "$issue_info" | jq -r '.title')

  if [ -z "$issue_title" ] || [ "$issue_title" = "null" ]; then
    print_error "Could not fetch issue title for #$issue_number"
    exit "$EXIT_ISSUE_NOT_FOUND"
  fi

  print_info "Issue title: $issue_title"

  # Parse type from title and slugify
  local type_prefix slug branch
  type_prefix=$(parse_type_from_title "$issue_title")
  slug=$(slugify_title "$issue_title")
  branch="${type_prefix}/${TICKET_PREFIX}${issue_number}-${slug}"

  print_info "Derived branch name: $branch"

  local sanitized_branch
  sanitized_branch=$(sanitize_for_dirname "$branch")

  mkdir -p "$WORKTREES_DIR"

  # Check if a worktree already exists for this branch (regardless of directory name)
  local existing_wt_for_branch=""
  while IFS=$'\t' read -r wt_path wt_branch; do
    if [ "$wt_branch" = "$branch" ]; then
      existing_wt_for_branch="$wt_path"
      break
    fi
  done < <(parse_worktree_list)

  if [ -n "$existing_wt_for_branch" ]; then
    print_error "A worktree for branch '$branch' already exists at: $existing_wt_for_branch"
    print_info "To navigate: cd $existing_wt_for_branch"
    exit "$EXIT_WORKTREE_EXISTS"
  fi

  # Check if branch exists locally or remotely
  local branch_exists=false
  if mgit show-ref --verify --quiet "refs/heads/$branch" 2>/dev/null; then
    branch_exists=true
    print_info "Branch '$branch' exists locally"
  elif mgit ls-remote --exit-code --heads origin "$branch" >/dev/null 2>&1; then
    branch_exists=true
    print_info "Branch '$branch' exists on remote, fetching..."
    mgit fetch origin "$branch"
  fi

  # Check if PR exists for this branch
  local existing_pr_info existing_pr existing_pr_url
  if ! existing_pr_info=$(gh pr list --head "$branch" --json number,url --jq '.[0] // empty'); then
    print_error "Failed to check for existing PRs"
    exit "$EXIT_GIT_FAILED"
  fi
  if [ -n "$existing_pr_info" ]; then
    existing_pr=$(echo "$existing_pr_info" | jq -r '.number')
    existing_pr_url=$(echo "$existing_pr_info" | jq -r '.url')
  fi

  local wt_name
  local wt_path
  local pr_number
  local pr_url

  if [ -n "$existing_pr" ]; then
    # PR exists, use PR number in worktree name
    pr_number="$existing_pr"
    pr_url="$existing_pr_url"
    wt_name="${existing_pr}-${sanitized_branch}"
    wt_path="$WORKTREES_DIR/$wt_name"
    print_info "PR #$existing_pr already exists for this branch"

    # Check if worktree already exists
    if [ -d "$wt_path" ]; then
      print_error "Worktree already exists at $wt_path"
      exit "$EXIT_WORKTREE_EXISTS"
    fi

    if [ "$branch_exists" = true ]; then
      print_info "Creating worktree with existing branch '$branch'..."
      if ! mgit worktree add "$wt_path" "$branch"; then
        print_error "Failed to create worktree"
        exit "$EXIT_GIT_FAILED"
      fi
    else
      print_error "Branch '$branch' doesn't exist but PR #$existing_pr references it"
      exit "$EXIT_ISSUE_NOT_FOUND"
    fi

    print_info "Installing dependencies..."
    if ! (cd "$wt_path" && npm ci); then
      print_error "Failed to install dependencies"
      exit "$EXIT_NPM_CI_FAILED"
    fi
  else
    # No PR yet - create branch, push, create PR, then create worktree with PR number
    if [ "$branch_exists" = false ]; then
      print_info "Creating new branch '$branch' from origin/main..."
      if ! mgit branch "$branch" origin/main; then
        print_error "Failed to create branch"
        exit "$EXIT_GIT_FAILED"
      fi
    fi

    print_info "Pushing branch to origin..."
    if ! SKIP_E2E_CHECK=true mgit push -u origin "$branch"; then
      print_error "Failed to push branch to origin"
      exit "$EXIT_GIT_FAILED"
    fi

    print_info "Creating draft PR..."

    # Create PR title from issue title (preserve original title format)
    local pr_title="$issue_title"

    # Add type prefix if not already present (case-insensitive check)
    if ! has_type_prefix "$pr_title"; then
      pr_title="${type_prefix}: ${pr_title}"
    fi

    local pr_create_output
    pr_create_output=$(gh pr create --draft --head "$branch" --title "$pr_title" --body "$(cat <<PREOF
## Summary

Closes #${issue_number}

## Changes

- [ ] TODO: List changes made

## Test plan

- [ ] Unit tests pass (\`npm test\`)
- [ ] Lint passes (\`npm run lint\`)
- [ ] Manual testing completed

## Screenshots (if applicable)

<!-- Add screenshots for UI changes -->

---
Generated with [Claude Code](https://claude.com/claude-code)
PREOF
)" 2>&1) || true

    # Check if PR was created or if it failed due to "no commits"
    if [[ "$pr_create_output" =~ ^https:// ]]; then
      pr_url="$pr_create_output"
      print_success "Draft PR created: $pr_url"
      pr_number=$(gh pr list --head "$branch" --json number --jq '.[0].number' 2>/dev/null)
      wt_name="${pr_number}-${sanitized_branch}"
    elif [[ "$pr_create_output" =~ "No commits between" ]]; then
      print_warning "No commits yet - PR will be created after first commit"
      print_info "Hint: Make a commit, then run 'gh pr create' to create the PR"
      wt_name="${issue_number}-${sanitized_branch}"
    else
      print_error "Failed to create PR: $pr_create_output"
      exit "$EXIT_PR_CREATE_FAILED"
    fi

    wt_path="$WORKTREES_DIR/$wt_name"

    # Check if worktree already exists
    if [ -d "$wt_path" ]; then
      print_error "Worktree already exists at $wt_path"
      exit "$EXIT_WORKTREE_EXISTS"
    fi

    print_info "Creating worktree with branch '$branch'..."
    if ! mgit worktree add "$wt_path" "$branch"; then
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

  print_summary "$wt_path" "$branch" "$pr_number" "$pr_url" "$issue_number"
  exit "$EXIT_SUCCESS"
}

# Main script
main() {
  check_dependencies

  print_info "Main repo: $MAIN_REPO"
  print_info "Worktrees dir: $WORKTREES_DIR"

  # Parse arguments
  if [ "${1:-}" = "--list" ] || [ "${1:-}" = "-l" ]; then
    list_worktrees
    exit "$EXIT_SUCCESS"
  elif [ "${1:-}" = "--prune" ] || [ "${1:-}" = "-p" ]; then
    cleanup_merged_worktrees
    exit "$EXIT_SUCCESS"
  elif [ "${1:-}" = "--remove" ] || [ "${1:-}" = "-r" ]; then
    remove_worktree "$2"
    exit "$EXIT_SUCCESS"
  elif [ "${1:-}" = "--help" ] || [ "${1:-}" = "-h" ] || [ -z "${1:-}" ]; then
    echo "Usage: $0 <issue-number|option>"
    echo ""
    echo "Options:"
    echo "  <issue-number>      Create worktree for GitHub issue (derives branch name)"
    echo "  --list, -l          List all worktrees with PR status"
    echo "  --prune, -p         Cleanup worktrees with merged/closed PRs"
    echo "  --remove, -r <name> Remove specific worktree"
    echo "  --help, -h          Show this help message"
    echo ""
    echo "Branch naming:"
    echo "  Branch name is derived from issue title:"
    echo "  - Format: <type>/<issue>-<slugified-title>"
    echo "  - Example: 'feat: Add dark mode' -> feat/42-add-dark-mode"
    echo "  - Type is parsed from title prefix (feat, fix, refactor, docs, chore, test, perf)"
    echo "  - Defaults to 'feat' if no recognized prefix"
    echo ""
    echo "Exit codes:"
    echo "  0 - Success"
    echo "  1 - Invalid arguments"
    echo "  2 - Worktree already exists"
    echo "  3 - Worktree not found"
    echo "  4 - PR still open (cannot remove)"
    echo "  5 - Issue not found"
    echo "  6 - PR creation failed"
    echo "  7 - npm ci failed"
    echo "  8 - Git operation failed"
    echo ""
    echo "Examples:"
    echo "  $0 42               # Start work on issue #42"
    echo "  $0 --list           # Show all worktrees"
    echo "  $0 --prune          # Cleanup merged worktrees"
    echo "  $0 --remove feat    # Remove worktree matching 'feat'"
    exit "$EXIT_SUCCESS"
  fi

  # Must be an issue number
  if ! [[ "$1" =~ ^[0-9]+$ ]]; then
    print_error "Argument must be a GitHub issue number"
    echo "Usage: $0 <issue-number>" >&2
    exit "$EXIT_INVALID_ARGS"
  fi

  # Cleanup first
  cleanup_merged_worktrees
  echo ""

  # Health check existing worktrees
  check_worktree_health

  create_from_issue "$1"
}

main "$@"

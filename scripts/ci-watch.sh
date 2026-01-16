#!/usr/bin/env bash
set -euo pipefail

# CI Watch Script
# Polls GitHub Actions until all jobs (excluding "build") complete
# Exits 0 on success, 1 on failure, 2 on timeout

readonly POLL_INTERVAL=15
readonly TIMEOUT_SECONDS=600  # 10 minutes
readonly EXCLUDED_JOBS="build"

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m'

print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Get current branch name
get_current_branch() {
  git rev-parse --abbrev-ref HEAD
}

# Get the latest workflow run ID for the current branch
get_latest_run_id() {
  local branch="$1"
  gh run list --branch "$branch" --limit 1 --json databaseId --jq '.[0].databaseId // empty'
}

# Get job statuses for a run, excluding specified jobs
# Returns: job_name<TAB>status<TAB>conclusion for each job
get_job_statuses() {
  local run_id="$1"
  gh run view "$run_id" --json jobs --jq '.jobs[] | "\(.name)\t\(.status)\t\(.conclusion // "null")"'
}

# Check if a job name should be excluded
is_excluded_job() {
  local job_name="$1"
  local excluded
  IFS=',' read -ra excluded <<< "$EXCLUDED_JOBS"
  for pattern in "${excluded[@]}"; do
    if [[ "$job_name" == "$pattern" ]]; then
      return 0
    fi
  done
  return 1
}

# Main polling loop
main() {
  local branch
  branch=$(get_current_branch)
  print_info "Watching CI for branch: $branch"

  # Wait a moment for GitHub to register the push
  sleep 3

  local run_id
  run_id=$(get_latest_run_id "$branch")

  if [[ -z "$run_id" ]]; then
    print_error "No workflow run found for branch '$branch'"
    exit 1
  fi

  print_info "Found workflow run: $run_id"
  print_info "Polling every ${POLL_INTERVAL}s (timeout: ${TIMEOUT_SECONDS}s)..."

  local start_time
  start_time=$(date +%s)

  while true; do
    local current_time elapsed
    current_time=$(date +%s)
    elapsed=$((current_time - start_time))

    if [[ $elapsed -ge $TIMEOUT_SECONDS ]]; then
      print_error "Timeout after ${TIMEOUT_SECONDS}s"
      exit 2
    fi

    local all_completed=true
    local any_failed=false
    local pending_jobs=()

    while IFS=$'\t' read -r job_name status conclusion; do
      # Skip excluded jobs
      if is_excluded_job "$job_name"; then
        continue
      fi

      if [[ "$status" != "completed" ]]; then
        all_completed=false
        pending_jobs+=("$job_name")
      elif [[ "$conclusion" == "failure" ]]; then
        any_failed=true
      fi
    done < <(get_job_statuses "$run_id")

    if [[ "$all_completed" == true ]]; then
      if [[ "$any_failed" == true ]]; then
        print_error "CI failed!"
        echo ""
        print_info "Failed job logs:"
        echo ""
        gh run view "$run_id" --log-failed
        exit 1
      else
        print_success "CI passed (excluding build)"
        exit 0
      fi
    fi

    local remaining=$((TIMEOUT_SECONDS - elapsed))
    print_info "Waiting for jobs: ${pending_jobs[*]} (${remaining}s remaining)"
    sleep "$POLL_INTERVAL"
  done
}

main "$@"

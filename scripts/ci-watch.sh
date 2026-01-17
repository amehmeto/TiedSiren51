#!/usr/bin/env bash
set -euo pipefail

# CI Watch Script
# Polls GitHub Actions until all jobs (excluding configurable jobs) complete
# Exits 0 on success, 1 on failure, 2 on timeout
#
# Environment variables:
#   CI_WATCH_EXCLUDED_JOBS - Comma-separated list of job patterns to exclude (default: "build")

# Check for required dependencies
if ! command -v gh &>/dev/null; then
  echo "[ERROR] GitHub CLI (gh) is required but not installed"
  echo "Install it from: https://cli.github.com/"
  exit 1
fi

readonly POLL_INTERVAL=15
readonly TIMEOUT_SECONDS=600  # 10 minutes
readonly EXCLUDED_JOBS="${CI_WATCH_EXCLUDED_JOBS:-build}"
readonly MAX_RUN_DETECTION_ATTEMPTS=10
readonly RUN_DETECTION_INTERVAL=3
readonly MAX_NO_JOBS_ATTEMPTS=5

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

# Get current commit SHA
get_current_sha() {
  git rev-parse HEAD
}

# Get the latest workflow run for the branch that matches the given SHA
# Returns: run_id or empty if not found
get_run_id_for_sha() {
  local branch="$1"
  local expected_sha="$2"
  gh run list --branch "$branch" --limit 5 --json databaseId,headSha \
    --jq ".[] | select(.headSha == \"$expected_sha\") | .databaseId" | head -1
}

# Get job statuses for a run
# Returns: job_name<TAB>status<TAB>conclusion for each job
get_job_statuses() {
  local run_id="$1"
  gh run view "$run_id" --json jobs --jq '.jobs[] | "\(.name)\t\(.status)\t\(.conclusion // "null")"'
}

# Check if a job name should be excluded (supports glob matching)
is_excluded_job() {
  local job_name="$1"
  local excluded
  IFS=',' read -ra excluded <<< "$EXCLUDED_JOBS"
  for pattern in "${excluded[@]}"; do
    # Use glob matching to support partial matches like "build" matching "build (ubuntu-latest)"
    if [[ "$job_name" == *"$pattern"* ]]; then
      return 0
    fi
  done
  return 1
}

# Wait for workflow run to be registered for the current commit
wait_for_run() {
  local branch="$1"
  local expected_sha="$2"
  local attempt=1

  print_info "Waiting for workflow run for commit ${expected_sha:0:7}..."

  while [[ $attempt -le $MAX_RUN_DETECTION_ATTEMPTS ]]; do
    local run_id
    run_id=$(get_run_id_for_sha "$branch" "$expected_sha")

    if [[ -n "$run_id" ]]; then
      echo "$run_id"
      return 0
    fi

    print_info "Attempt $attempt/$MAX_RUN_DETECTION_ATTEMPTS: workflow not found yet..."
    sleep "$RUN_DETECTION_INTERVAL"
    attempt=$((attempt + 1))
  done

  return 1
}

# Main polling loop
main() {
  local branch current_sha
  branch=$(get_current_branch)
  current_sha=$(get_current_sha)
  print_info "Watching CI for branch: $branch (commit: ${current_sha:0:7})"

  local run_id
  if ! run_id=$(wait_for_run "$branch" "$current_sha"); then
    print_error "No workflow run found for commit ${current_sha:0:7} after $MAX_RUN_DETECTION_ATTEMPTS attempts"
    exit 1
  fi

  print_info "Found workflow run: $run_id"
  print_info "Polling every ${POLL_INTERVAL}s (timeout: ${TIMEOUT_SECONDS}s)..."
  if [[ -n "$EXCLUDED_JOBS" ]]; then
    print_info "Excluded jobs: $EXCLUDED_JOBS"
  fi

  local start_time no_jobs_count
  start_time=$(date +%s)
  no_jobs_count=0

  while true; do
    local current_time elapsed
    current_time=$(date +%s)
    elapsed=$((current_time - start_time))

    if [[ $elapsed -ge $TIMEOUT_SECONDS ]]; then
      print_warning "Timeout after ${TIMEOUT_SECONDS}s"
      exit 2
    fi

    local all_completed=true
    local any_failed=false
    local pending_jobs=()
    local job_count=0

    while IFS=$'\t' read -r job_name status conclusion; do
      # Skip excluded jobs
      if is_excluded_job "$job_name"; then
        continue
      fi

      job_count=$((job_count + 1))

      if [[ "$status" != "completed" ]]; then
        all_completed=false
        pending_jobs+=("$job_name")
      elif [[ "$conclusion" != "success" && "$conclusion" != "skipped" ]]; then
        # Treat failure, cancelled, and other non-success conclusions as failures
        any_failed=true
      fi
    done < <(get_job_statuses "$run_id")

    # If no jobs found yet, keep waiting but track attempts to avoid infinite loop
    if [[ $job_count -eq 0 ]]; then
      no_jobs_count=$((no_jobs_count + 1))
      if [[ $no_jobs_count -ge $MAX_NO_JOBS_ATTEMPTS ]]; then
        print_error "No jobs found after $MAX_NO_JOBS_ATTEMPTS attempts (jobs may all be excluded or workflow has no jobs)"
        exit 1
      fi
      print_info "No jobs found yet (attempt $no_jobs_count/$MAX_NO_JOBS_ATTEMPTS), waiting..."
      sleep "$POLL_INTERVAL"
      continue
    fi

    # Reset counter when jobs are found
    no_jobs_count=0

    if [[ "$all_completed" == true ]]; then
      if [[ "$any_failed" == true ]]; then
        print_error "CI failed!"
        echo ""
        print_info "Failed job logs:"
        echo ""
        gh run view "$run_id" --log-failed
        exit 1
      else
        print_success "CI passed (excluded: $EXCLUDED_JOBS)"
        exit 0
      fi
    fi

    local remaining=$((TIMEOUT_SECONDS - elapsed))
    print_info "Waiting for jobs: ${pending_jobs[*]} (${remaining}s remaining)"
    sleep "$POLL_INTERVAL"
  done
}

main "$@"

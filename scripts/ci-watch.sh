#!/usr/bin/env bash
set -euo pipefail

# CI Watch Script
# Polls GitHub Actions until all jobs (excluding configurable jobs) complete
# Exits 0 on success, 1 on failure, 2 on timeout
#
# Environment variables:
#   CI_WATCH_EXCLUDED_JOBS - Comma-separated list of job patterns to exclude (default: "build")
#   CI_WATCH_WORKFLOW - Workflow name to filter by (default: all workflows)
#   SKIP_CI_WATCH - Set to any non-empty value to skip CI watching

# Source shared colors
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/lib/colors.sh"

# Allow skipping CI watch (useful for quick pushes)
if [[ -n "${SKIP_CI_WATCH:-}" ]]; then
  print_info "SKIP_CI_WATCH is set, skipping CI monitoring"
  exit 0
fi

# Check for required dependencies
if ! command -v gh &>/dev/null; then
  print_error "GitHub CLI (gh) is required but not installed"
  echo "Install it from: https://cli.github.com/"
  exit 1
fi

# Check if gh is authenticated
if ! gh auth status &>/dev/null; then
  print_error "GitHub CLI is not authenticated"
  echo "Run 'gh auth login' to authenticate"
  exit 1
fi

readonly POLL_INTERVAL=15
readonly TIMEOUT_SECONDS=600  # 10 minutes
readonly EXCLUDED_JOBS="${CI_WATCH_EXCLUDED_JOBS:-build}"
readonly WORKFLOW_NAME="${CI_WATCH_WORKFLOW:-}"
readonly MAX_RUN_DETECTION_ATTEMPTS=10
readonly RUN_DETECTION_INTERVAL=3
readonly MAX_NO_JOBS_ATTEMPTS=5

# Hash command for portability (macOS has shasum, Linux may only have sha1sum)
hash_cmd() {
  if command -v shasum &>/dev/null; then
    shasum
  else
    sha1sum
  fi
}

# Lock file to prevent multiple concurrent CI watch processes
LOCK_FILE="/tmp/ci-watch-$(git rev-parse --show-toplevel 2>/dev/null | hash_cmd | cut -d' ' -f1).lock"
readonly LOCK_FILE

# Global temp file for API error capture (cleaned up by trap on exit/interrupt)
API_ERROR_TMPFILE=""

# Cleanup function for lock file and temp files
cleanup() {
  rm -f "$LOCK_FILE"
  [[ -n "$API_ERROR_TMPFILE" ]] && rm -f "$API_ERROR_TMPFILE"
}

# Acquire lock to prevent race conditions from multiple pushes
# Uses flock for atomic locking when available, falls back to PID-based locking
acquire_lock() {
  # Try flock-based locking first (atomic, no TOCTOU race)
  if command -v flock &>/dev/null; then
    exec 200>"$LOCK_FILE"
    if ! flock -n 200; then
      print_warning "Another CI watch process is already running"
      exit 0
    fi
    # Write PID for debugging purposes
    echo $$ >&200
    trap cleanup EXIT INT TERM
    return 0
  fi

  # Fallback for systems without flock (e.g., macOS)
  # Uses atomic mkdir as a lock mechanism (mkdir is atomic on POSIX)
  # PID is stored inside the lock directory to avoid TOCTOU race
  local lock_dir="${LOCK_FILE}.d"
  local pid_file="$lock_dir/pid"
  if ! mkdir "$lock_dir" 2>/dev/null; then
    # Lock exists, check if process is still running
    local pid
    pid=$(cat "$pid_file" 2>/dev/null || echo "")
    if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
      print_warning "Another CI watch process is already running (PID: $pid)"
      exit 0
    fi
    # Stale lock, remove and retry
    rm -rf "$lock_dir"
    if ! mkdir "$lock_dir" 2>/dev/null; then
      print_warning "Failed to acquire lock, another process may have started"
      exit 0
    fi
  fi
  echo $$ > "$pid_file"
  # Cleanup the lock directory and any temp files
  trap 'rm -rf "${LOCK_FILE}.d"; [[ -n "$API_ERROR_TMPFILE" ]] && rm -f "$API_ERROR_TMPFILE"' EXIT INT TERM
}

# Get current branch name
get_current_branch() {
  local branch
  branch=$(git rev-parse --abbrev-ref HEAD)
  if [[ "$branch" == "HEAD" ]]; then
    print_error "Cannot watch CI in detached HEAD state"
    exit 1
  fi
  echo "$branch"
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
  local workflow_args=()
  if [[ -n "$WORKFLOW_NAME" ]]; then
    workflow_args=(--workflow "$WORKFLOW_NAME")
  fi
  gh run list --branch "$branch" "${workflow_args[@]}" --limit 5 --json databaseId,headSha \
    --jq "[.[] | select(.headSha == \"$expected_sha\") | .databaseId][0] // empty"
}

# Get job statuses for a run
# Returns: job_name<TAB>status<TAB>conclusion for each job
# Returns empty string on API errors to avoid script exit due to set -e
get_job_statuses() {
  local run_id="$1"
  local output exit_code
  # Use global temp file so it gets cleaned up on interrupt via trap
  API_ERROR_TMPFILE=$(mktemp)
  output=$(gh run view "$run_id" --json jobs --jq '.jobs[] | "\(.name)\t\(.status)\t\(.conclusion // "null")"' 2>"$API_ERROR_TMPFILE") && exit_code=0 || exit_code=$?
  if [[ $exit_code -ne 0 ]]; then
    local err_msg
    err_msg=$(cat "$API_ERROR_TMPFILE")
    rm -f "$API_ERROR_TMPFILE"
    API_ERROR_TMPFILE=""
    if [[ -n "$err_msg" ]]; then
      print_warning "GitHub API error (will retry): $err_msg" >&2
    fi
    echo ""
    return 0
  fi
  rm -f "$API_ERROR_TMPFILE"
  API_ERROR_TMPFILE=""
  echo "$output"
}

# Check if a job name should be excluded (uses substring matching)
is_excluded_job() {
  local job_name="$1"
  local excluded
  IFS=',' read -ra excluded <<< "$EXCLUDED_JOBS"
  for pattern in "${excluded[@]}"; do
    # Use substring matching to support partial matches like "build" matching "build (ubuntu-latest)"
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
  # Acquire lock to prevent multiple concurrent CI watch processes
  acquire_lock

  local branch current_sha
  # Use PUSHED_BRANCH/PUSHED_SHA from hook if available, otherwise detect from HEAD
  branch="${PUSHED_BRANCH:-$(get_current_branch)}"
  current_sha="${PUSHED_SHA:-$(get_current_sha)}"
  print_info "Watching CI for branch: $branch (commit: ${current_sha:0:7})"

  local run_id
  if ! run_id=$(wait_for_run "$branch" "$current_sha"); then
    print_error "No workflow run found for commit ${current_sha:0:7} after $MAX_RUN_DETECTION_ATTEMPTS attempts"
    exit 1
  fi

  print_info "Found workflow run: $run_id"
  print_info "Polling every ${POLL_INTERVAL}s (timeout: ${TIMEOUT_SECONDS}s)..."
  if [[ -n "$WORKFLOW_NAME" ]]; then
    print_info "Workflow filter: $WORKFLOW_NAME"
  fi
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
    local failed_jobs=()
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
        failed_jobs+=("$job_name ($conclusion)")
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
        print_info "Failed jobs:"
        for job in "${failed_jobs[@]}"; do
          echo "  - $job"
        done
        echo ""
        print_info "Fetching failed job logs..."
        echo ""
        gh run view "$run_id" --log-failed
        exit 1
      else
        print_success "CI passed (excluded: $EXCLUDED_JOBS)"
        exit 0
      fi
    fi

    local remaining=$((TIMEOUT_SECONDS - elapsed))
    local IFS=', '
    print_info "Waiting for jobs: ${pending_jobs[*]:-none} (${remaining}s remaining)"
    sleep "$POLL_INTERVAL"
  done
}

main "$@"

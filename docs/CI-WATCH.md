# CI Watch (Post-Push)

After each push, CI status is automatically monitored via Husky hooks. The script polls GitHub Actions and reports results. Press **Ctrl+C** to cancel.

## Claude Code Behavior

The `CLAUDE_CODE=1` env var is set via `.claude/settings.local.json`. This enables stricter behavior:

- CI watch is mandatory (cannot be skipped with `SKIP_CI_WATCH`)
- PR descriptions are auto-updated after CI passes
- Always wait for CI to complete - treat failures like local test failures

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CI_WATCH_EXCLUDED_JOBS` | `build` | Job patterns to exclude (supports partial matching) |
| `CI_WATCH_INITIAL_DELAY` | `10` | Seconds to wait before polling for workflow |
| `CI_WATCH_REMOTE` | `origin` | Git remote name to watch |
| `CI_WATCH_WORKFLOW` | (all) | Workflow name filter |
| `SKIP_CI_WATCH` | (unset) | Skip CI monitoring (e.g., `SKIP_CI_WATCH=1 git push`) |
| `SKIP_E2E_CHECK` | (unset) | Push without interactive e2e test prompt |
| `AUTO_PR_UPDATE` | (unset) | Developers: opt-in to auto-update PR description after CI |

## Exit Codes

- `0` = success
- `1` = failure
- `2` = timeout

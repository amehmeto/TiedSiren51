# Scripts Audit

**Priority**: 📋 **LOW**
**Effort**: Low
**Status**: Open - Cleanup Needed
**Created**: January 19, 2026
**Last Audited**: January 19, 2026

## Overview

This document provides an exhaustive audit of all scripts in the project, categorizing them by usage status and location.

## Script Locations

| Directory | Purpose |
|-----------|---------|
| `scripts/` | Build, CI, and development utilities |
| `scripts/lib/` | Shared shell utilities |
| `scripts/ticket-graph/` | GitHub issue dependency graphing |
| `scripts/remark-lint-ticket/` | Custom remark linter for issue templates |
| `.husky/scripts/` | Git hook scripts |
| `.claude/hooks/` | Claude Code validation hooks |
| `.github/scripts/` | GitHub Actions automation |

## Scripts by Status

### Actively Used

These scripts are referenced in CI workflows, git hooks, package.json, or other automation.

#### `scripts/` - Main Scripts

| Script | Used By | Purpose |
|--------|---------|---------|
| `lint.sh` | `package.json` (`lint`, `lint:fix`) | Orchestrates all linters (types, js, format, md, sh, workflow) |
| `lint-workflow-scripts.sh` | `package.json` (`lint:workflow`) | Validates inline bash in GitHub workflow YAML files |
| `ci-watch.sh` | `.husky/post-push` | Monitors GitHub Actions CI status after push |
| `compare-coverage.cjs` | `.husky/pre-push` | Compares coverage against baseline, blocks regression |
| `worktree.sh` | `.github/scripts/start-issue.sh`, `/worktree` skill | Creates git worktrees with branch, PR, and npm ci setup |
| `check-cache-freshness.sh` | CI (`hephaestus.yml`) | Checks if coverage cache is fresh enough to use |
| `check-package-json-build-impact.sh` | CI (`hecate.yml`) | Detects if package.json changes affect build (deps vs scripts) |
| `cleanup-pr-releases.sh` | CI (`hades.yml`) | Cleans up draft releases from closed PRs |
| `create-release-with-apk.sh` | CI (`hades.yml`) | Creates GitHub release with APK artifact |
| `find-apk.sh` | CI (`hephaestus.yml`) | Locates built APK file for artifact upload |
| `prepare-base-coverage.sh` | CI (`moirai.yml`) | Prepares base coverage for PR comparison |
| `store-coverage.sh` | CI (`moirai.yml`) | Stores coverage data for caching |
| `lint-pr.mjs` | `.claude/hooks/validate-pr.sh` | Validates PR title/body format (conventional commits, sections) |
| `lint-pr.test.mjs` | Vitest | Tests for `lint-pr.mjs` |

#### `scripts/lib/` - Shared Utilities

| Script | Used By | Purpose |
|--------|---------|---------|
| `colors.sh` | `lint.sh` | ANSI color constants for terminal output |

#### `scripts/ticket-graph/` - Issue Dependency Graphing

| Script | Used By | Purpose |
|--------|---------|---------|
| `generate-dependency-graph.mjs` | `package.json` (`graph`, `graph:view`, `graph:live`) | Entry point for dependency graph generation |
| `index.mjs` | `generate-dependency-graph.mjs` | Main module exports |
| `ticket-graph.mjs` | Internal | Core graph building logic |
| `github-fetcher.mjs` | Internal | Fetches issues from GitHub API |
| `mermaid-renderer.mjs` | Internal | Renders graph as Mermaid diagram |
| `ticket-graph.spec.mjs` | Vitest | Tests for ticket graph logic |
| `generate-dependency-graph.spec.mjs` | Vitest | Tests for graph generation |

#### `scripts/remark-lint-ticket/` - Issue Template Linting

| Script | Used By | Purpose |
|--------|---------|---------|
| `index.mjs` | `.remarkrc.mjs` | Custom remark plugin for issue template validation |
| `config.mjs` | `index.mjs`, `lint-pr.mjs` | Shared config (valid repos, abbreviations) |
| `index.test.mjs` | Vitest | Tests for remark-lint-ticket |

#### `.husky/scripts/` - Git Hook Scripts

| Script | Used By | Purpose |
|--------|---------|---------|
| `branch-name-check.sh` | `.husky/pre-push` | Validates branch naming convention |
| `check-conflicts-with-main.sh` | `.husky/pre-push` | Detects merge conflicts with main before push |
| `e2e-test-check.sh` | `.husky/pre-push` | Prompts for e2e test verification (skippable) |
| `no-commits-on-main-demo.sh` | `.husky/pre-commit` | Prevents direct commits to main (for demos) |
| `no-direct-push-main-demo.sh` | `.husky/pre-push` | Prevents direct push to main (for demos) |
| `uncommitted-files-check.sh` | `.husky/pre-push` | Ensures no uncommitted changes before push |

#### `.claude/hooks/` - Claude Code Hooks

| Script | Used By | Purpose |
|--------|---------|---------|
| `remind-adrs.sh` | `.claude/settings.local.json` (PreToolUse:Edit) | Reminds about relevant ADRs when editing files |
| `validate-edit.sh` | `.claude/settings.local.json` (PostToolUse:Edit\|Write) | Validates edits (shellcheck for .sh files) |
| `validate-pr.sh` | `.claude/settings.local.json` (PreToolUse:gh pr) | Validates PR title/body before creation |
| `validate-ticket.sh` | `.claude/settings.local.json` (PreToolUse:gh issue) | Validates issue format before creation |

#### `.github/scripts/` - GitHub Actions Scripts

| Script | Used By | Purpose |
|--------|---------|---------|
| `start-issue.sh` | CI (`cerberus.yml`) | Creates worktree and starts Claude session for an issue |

### Not Used (Orphaned)

These scripts exist but are not referenced anywhere in active code paths.

| Script | package.json? | CI? | Hooks? | Notes |
|--------|---------------|-----|--------|-------|
| `track-coverage.js` | `test:cov:track` | No | No | Script defined but npm command never invoked |
| `view-coverage-history.js` | `test:cov:history` | No | No | Script defined but npm command never invoked |
| `send-slack-notification.sh` | No | No | No | Only referenced in comments |
| `commit-graph-update.sh` | No | Commented out | No | Was in CI, now commented out |
| `setup-google-services.cjs` | No | No | No | Not referenced anywhere |

### Husky Internal

| Script | Purpose |
|--------|---------|
| `.husky/_/husky.sh` | Husky internal bootstrap (auto-generated) |

## Recommended Actions

### Immediate Cleanup

1. **Remove `scripts/setup-google-services.cjs`**
   - Not referenced anywhere
   - CI creates `google-services.json` directly from secret via `printf`

2. **Remove `scripts/send-slack-notification.sh`**
   - Only appears in comments
   - No Slack integration configured

### Decision Needed

3. **`scripts/track-coverage.js` and `scripts/view-coverage-history.js`**
   - **Option A**: Remove - unused manual utilities
   - **Option B**: Keep - useful for local coverage tracking over time
   - `coverage-history.json` is gitignored, so no history is persisted anyway

4. **`scripts/commit-graph-update.sh`**
   - Currently commented out in CI
   - **Option A**: Remove if feature abandoned
   - **Option B**: Re-enable if still planned

## Script Dependencies

```
.husky/pre-commit
├── no-commits-on-main-demo.sh
├── tsc (via npm)
└── lint-staged (via npm)

.husky/pre-push
├── e2e-test-check.sh
├── no-direct-push-main-demo.sh
├── branch-name-check.sh
├── uncommitted-files-check.sh
├── expo-doctor (via npm)
├── test:cov (via npm)
├── compare-coverage.cjs
└── check-conflicts-with-main.sh

.husky/post-push
└── ci-watch.sh

scripts/lint.sh
└── lib/colors.sh

scripts/worktree.sh
└── (called by .github/scripts/start-issue.sh)

.github/scripts/start-issue.sh
└── scripts/worktree.sh

.claude/hooks/validate-pr.sh
└── scripts/lint-pr.mjs
    └── scripts/remark-lint-ticket/config.mjs

.remarkrc.mjs
└── scripts/remark-lint-ticket/index.mjs
    └── scripts/remark-lint-ticket/config.mjs
```

## CI Workflow Script Usage

| Workflow | Scripts Used |
|----------|--------------|
| `cerberus.yml` | `start-issue.sh` |
| `hades.yml` | `cleanup-pr-releases.sh`, `create-release-with-apk.sh` |
| `hecate.yml` | `check-package-json-build-impact.sh` |
| `hephaestus.yml` | `check-cache-freshness.sh`, `find-apk.sh` |
| `moirai.yml` | `prepare-base-coverage.sh`, `store-coverage.sh`, `compare-coverage.cjs` |

## Maintenance Guidelines

### When Adding Scripts

1. Document purpose in script header comment
2. Add to this audit document
3. If utility script, add to `package.json` scripts
4. If CI script, reference in appropriate workflow
5. If hook script, configure in appropriate hook file

### When Removing Scripts

1. Search for all references: `grep -r "script-name" --include="*.sh" --include="*.json" --include="*.yml" --include="*.mjs" --include="*.js"`
2. Remove from package.json if present
3. Remove from CI workflows if present
4. Remove from hook configurations if present
5. Update this audit document

### Periodic Audit

Run this command to find potentially orphaned scripts:

```bash
# Find all scripts
find scripts .husky/scripts .claude/hooks .github/scripts -name "*.sh" -o -name "*.js" -o -name "*.mjs" -o -name "*.cjs" 2>/dev/null | sort

# For each script, check if it's referenced
for script in $(find scripts -maxdepth 1 -name "*.sh" -o -name "*.js" -o -name "*.mjs" -o -name "*.cjs" 2>/dev/null); do
  name=$(basename "$script")
  refs=$(grep -r "$name" --include="*.sh" --include="*.json" --include="*.yml" --include="*.yaml" --include="*.mjs" . 2>/dev/null | grep -v "^Binary" | wc -l)
  echo "$name: $refs references"
done
```

## Related Documentation

- [CLAUDE.md](../../CLAUDE.md) - Commands section references npm scripts
- [.github/workflows/README.md](../../.github/workflows/README.md) - CI workflow documentation
- [ADR: Developer Tooling](../adr/conventions/developer-tooling.md) - Tooling decisions

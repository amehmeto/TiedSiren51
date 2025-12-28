# Developer Tooling Conventions

Date: 2025-12-28

## Status

Accepted

## Context

TiedSiren51 relies on multiple layers of developer tooling to maintain code quality, enforce conventions, and streamline workflows:

1. **Git hooks** - Automated checks before commits and pushes
2. **Claude Code hooks** - AI-assisted development with guardrails
3. **Custom scripts** - Project-specific automation
4. **Claude Code commands** - Reusable AI workflows (skills)

Without clear conventions, tooling becomes scattered, duplicated, or inconsistent. This ADR documents where tooling lives, naming patterns, and integration points.

## Decision

### Directory Structure

```
scripts/                        # Standalone scripts (CI, automation, utilities)
├── *.sh                        # Shell scripts
├── *.cjs                       # CommonJS Node scripts (for require() compatibility)
├── *.js                        # ES module Node scripts
└── {tool-name}/                # Self-contained tooling packages
    ├── index.mjs               # Main entry point
    ├── index.test.mjs          # Colocated tests
    └── package.json            # Package metadata (peerDependencies)

.husky/                         # Git hooks (managed by Husky)
├── pre-commit                  # Runs before each commit
├── pre-push                    # Runs before each push
└── scripts/                    # Helper scripts for hooks
    └── *.sh                    # Individual check scripts

.claude/                        # Claude Code configuration
├── settings.local.json         # Permissions, hooks, denied commands
├── hooks/                      # Claude Code hook scripts
│   └── *.sh                    # PreToolUse/PostToolUse handlers
└── commands/                   # Claude Code skills (slash commands)
    └── *.md                    # Skill definitions
```

### Script Inventory

#### CI/CD Scripts (`scripts/`)

| Script | Purpose | Used By |
|--------|---------|---------|
| `worktree.sh` | Manage git worktrees with PR integration | Claude `/worktree` skill, developers |
| `compare-coverage.cjs` | Compare test coverage against base branch | `pre-push`, GitHub Actions |
| `track-coverage.js` | Track coverage history over time | GitHub Actions |
| `view-coverage-history.js` | Display coverage trends | Developers |
| `store-coverage.sh` | Store coverage artifacts | GitHub Actions |
| `prepare-base-coverage.sh` | Fetch base branch coverage for comparison | GitHub Actions |
| `check-cache-freshness.sh` | Validate CI cache state | GitHub Actions |
| `lint-workflow-scripts.sh` | Lint GitHub workflow shell scripts | CI, `npm run lint:sh` |
| `send-slack-notification.sh` | Post build notifications to Slack | GitHub Actions |
| `create-release-with-apk.sh` | Create GitHub release with APK artifact | GitHub Actions |
| `find-apk.sh` | Locate built APK file | Release workflow |
| `cleanup-pr-releases.sh` | Remove stale PR preview releases | GitHub Actions |
| `setup-google-services.cjs` | Configure Firebase from secrets | CI setup |

#### Remark Plugins (`scripts/remark-lint-ticket/`)

| Component | Purpose |
|-----------|---------|
| `index.mjs` | Validate GitHub issue tickets against template rules |
| `index.test.mjs` | Plugin tests using vitest |
| `package.json` | Declares peer dependencies |

Configuration: `.remarkrc.mjs` at project root.

### Git Hooks (`husky`)

#### Pre-commit (`pre-commit`)

Runs on every commit:
1. `no-commits-on-main-demo.sh` - Prevent commits directly to main
2. `npx tsc --noEmit` - Full project type check
3. `npx lint-staged` - Run linters on staged files only

#### Pre-push (`pre-push`)

Runs before pushing:
1. `e2e-test-check.sh` - Warn about pending E2E tests
2. `no-direct-push-main-demo.sh` - Prevent direct pushes to main
3. `branch-name-check.sh` - Enforce branch naming convention
4. `uncommitted-files-check.sh` - Warn about uncommitted changes
5. `npx expo-doctor` - Check Expo configuration health
6. `npm run test:cov` - Run tests with coverage
7. `compare-coverage.cjs` - Fail if coverage decreased

### Claude Code Hooks

Configured in `.claude/settings.local.json` under the `hooks` key.

#### Notification Hook

```json
{
  "Notification": [{
    "hooks": [{
      "type": "command",
      "command": "afplay /System/Library/Sounds/Purr.aiff"
    }]
  }]
}
```

Plays a sound when Claude completes a task.

#### PreToolUse: Ticket Validation (`validate-ticket.sh`)

**Trigger:** `Bash` tool with `gh issue create` or `gh issue edit` command
**Purpose:** Validate issue body against ticket templates before creation/modification
**Behavior:**
- Extracts `--body` content from command
- Runs remark linter with `.remarkrc.mjs` configuration
- Blocks with JSON `{ "decision": "block", ... }` if validation fails
- Passes silently if valid

#### PostToolUse: Edit Validation (`validate-edit.sh`)

**Trigger:** `Edit` or `Write` tools
**Purpose:** Run appropriate linters after file modifications
**Behavior by file type:**
- `.ts/.tsx/.js/.jsx` - ESLint with auto-fix, then Prettier
- `.json` - Prettier (+ ESLint for `.claude/` files)
- `.md` - Remark link validation
- `.sh` - Shellcheck
- `.yml/.yaml` - Prettier
- `.prisma` - Prisma validate

### Claude Code Skills (`commands/`)

Skills are invoked with `/skill-name` in Claude Code conversations.

| Skill | Description |
|-------|-------------|
| `/worktree` | Manage git worktrees (create, list, prune, remove) |
| `/arch-review` | Review PR for architecture compliance, update ADRs |
| `/speckit.specify` | Create feature specification from description |
| `/speckit.clarify` | Ask clarification questions for spec |
| `/speckit.plan` | Generate implementation plan |
| `/speckit.tasks` | Generate task list from spec/plan |
| `/speckit.implement` | Execute tasks from tasks.md |
| `/speckit.checklist` | Generate custom checklist for feature |
| `/speckit.analyze` | Cross-artifact consistency analysis |
| `/speckit.constitution` | Create/update project principles |
| `/speckit.taskstoissues` | Convert tasks to GitHub issues |

### Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Shell scripts | `kebab-case.sh` | `lint-workflow-scripts.sh` |
| Node scripts (CJS) | `kebab-case.cjs` | `compare-coverage.cjs` |
| Node scripts (ESM) | `kebab-case.js` or `.mjs` | `track-coverage.js` |
| Tooling packages | `kebab-case/` directory | `remark-lint-ticket/` |
| Claude hooks | `validate-{what}.sh` | `validate-edit.sh` |
| Claude skills | `{namespace}.{action}.md` | `speckit.specify.md` |
| Husky helper scripts | `{check-name}.sh` | `branch-name-check.sh` |

### Adding New Tooling

#### New Script

1. Add to `scripts/` with appropriate extension
2. Make executable: `chmod +x scripts/your-script.sh`
3. Add npm script in `package.json` if frequently used
4. Document purpose in script header comment

#### New Claude Code Hook

1. Create script in `.claude/hooks/`
2. Follow existing pattern: read JSON stdin, output JSON decision
3. Register in `.claude/settings.local.json` under appropriate event
4. Test manually before committing

#### New Claude Code Skill

1. Create `.md` file in `.claude/commands/`
2. Add YAML frontmatter with `description`
3. Write prompt instructions in markdown body
4. Skill becomes available as `/filename` (without .md)

#### New Remark Plugin

1. Create directory under `scripts/{plugin-name}/`
2. Export default function returning `(tree, file) => void`
3. Add tests in colocated `index.test.mjs`
4. Register in `.remarkrc.mjs`

## Consequences

### Positive

- **Discoverability**: Clear locations for each type of tooling
- **Consistency**: Naming patterns make purpose obvious
- **Testability**: Tooling packages have colocated tests
- **Modularity**: Self-contained packages with declared dependencies
- **AI-assisted workflow**: Claude Code hooks enforce standards automatically

### Negative

- **Multiple hook systems**: Git hooks (Husky) and Claude hooks serve different purposes but can confuse newcomers
- **Maintenance burden**: Hooks must stay in sync with lint-staged configuration
- **Platform-specific**: Some hooks assume macOS (`afplay`)

### Neutral

- **JSON configuration**: Claude hooks configured in JSON, Git hooks in shell scripts
- **Mixed languages**: Shell, JavaScript (CJS and ESM) based on use case

## Alternatives Considered

### 1. Single Hooks Directory

Combining all hooks (Git, Claude) in one location.

**Rejected because:** Different lifecycle events and configuration mechanisms; keeping them separate matches their tooling.

### 2. TypeScript for All Scripts

Using TypeScript instead of JavaScript/Shell.

**Rejected because:** Shell scripts are simpler for system-level tasks; Node scripts don't need TS compilation overhead for simple utilities.

### 3. Monorepo Tooling Package

Publishing tooling as a separate npm package.

**Rejected because:** Tooling is project-specific; overhead of package management not justified.

## Implementation Notes

### Key Files

- `.claude/settings.local.json` - Claude Code configuration
- `.husky/pre-commit`, `.husky/pre-push` - Git hook entry points
- `.remarkrc.mjs` - Remark linter configuration
- `package.json` - npm scripts and dev dependencies

### Related ADRs

- [Vitest Over Jest](../testing/vitest-over-jest.md) - Test runner for tooling tests
- [Coverage Tracking](../testing/coverage-tracking.md) - Coverage comparison scripts

## References

- [Husky Documentation](https://typicode.github.io/husky/)
- [Claude Code Hooks](https://docs.anthropic.com/en/docs/claude-code/hooks)
- [Remark Plugin Guide](https://github.com/remarkjs/remark/blob/main/doc/plugins.md)
- PR #190 - Added ticket linter and validate-ticket hook

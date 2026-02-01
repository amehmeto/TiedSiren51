# TiedSiren51

React Native app blocker with device sync. Users create "sirens" (apps/websites/keywords), organize them into blocklists, and run timed block sessions.

## Architecture

Hexagonal architecture with three layers. Dependencies flow inward: UI and Infra depend on Core.

```
app/          → Expo Router navigation (file-based routes)
ui/           → Components, screens, design system, view models
core/         → Business logic, Redux slices, ports (interfaces)
  _ports_/    → Interface definitions for external dependencies
  _redux_/    → Store setup, listener registration
  {domain}/   → Domain logic (auth, block-session, blocklist, siren)
infra/        → Adapter implementations (Firebase, Prisma, Expo APIs)
tests/        → Test utilities, fixtures, builders
```

Read `/docs/adr/README.md` before structural changes - it indexes all architectural decisions by layer.

## Before Writing Code

**Read relevant ADRs before implementing.** ADRs contain naming conventions, patterns, and examples that must be followed:

| When writing... | Read first |
|-----------------|------------|
| Listeners | `/docs/adr/core/listener-pattern.md` |
| Tests & Fixtures | `/docs/adr/testing/fixture-pattern.md` |
| Test doubles (stubs/fakes) | `/docs/adr/testing/stub-vs-fake-implementations.md` |
| Repositories | `/docs/adr/core/repository-pattern.md` |
| View models | `/docs/adr/ui/view-model-pattern.md` |

## Commands

```bash
npm test              # Run tests (watch mode)
npm run lint          # TypeScript + ESLint + Prettier
npm run lint:fix      # Auto-fix lint issues
npx prisma generate   # Regenerate Prisma client after schema changes
SKIP_E2E_CHECK=true git push  # Push without interactive e2e test prompt
```

## Workflow

1. **When you believe you're done with a task, run `/commit-push`** to commit all changes and push to remote.
2. **After CI passes, update the PR description** to accurately reflect all changes made.

## CI Watch (Post-Push)

After each push, CI status is automatically monitored via Husky hooks. The script polls GitHub Actions and reports results. Press **Ctrl+C** to cancel.

**IMPORTANT FOR CLAUDE CODE:** The `CLAUDE_CODE=1` env var is set via `.claude/settings.local.json`. This enables stricter behavior:
- CI watch is mandatory (cannot be skipped with `SKIP_CI_WATCH`)
- PR descriptions are auto-updated after CI passes
- Always wait for CI to complete - treat failures like local test failures

**Environment variables:**

| Variable | Default | Description |
|----------|---------|-------------|
| `CI_WATCH_EXCLUDED_JOBS` | `build` | Job patterns to exclude (supports partial matching) |
| `CI_WATCH_INITIAL_DELAY` | `10` | Seconds to wait before polling for workflow |
| `CI_WATCH_REMOTE` | `origin` | Git remote name to watch |
| `CI_WATCH_WORKFLOW` | (all) | Workflow name filter |
| `SKIP_CI_WATCH` | (unset) | Skip CI monitoring (e.g., `SKIP_CI_WATCH=1 git push`) |
| `AUTO_PR_UPDATE` | (unset) | Developers: opt-in to auto-update PR description after CI |

**Exit codes:** `0` = success, `1` = failure, `2` = timeout

## IMPORTANT: Anti-patterns

**NEVER use `I` prefix for interfaces.** Ports use descriptive names: `AuthGateway`, not `IAuthGateway`. ESLint enforces this.

**NEVER import from `infra/` in `core/`.** Core defines ports; Infra implements them. Dependency inversion is mandatory.

**NEVER put business logic in React components.** Logic belongs in Redux slices, use cases, or listeners. Components consume view models.

**NEVER use `switch` statements.** ESLint forbids them - use object maps or if/else chains.

**NEVER use type assertions (`as Type`) for branded types.** Use type guards (`isX()`) or assertion functions (`assertX()`) instead. See `/docs/adr/conventions/type-guards-for-branded-types.md`.

## Patterns

| Pattern | Location | ADR |
|---------|----------|-----|
| Hexagonal Architecture | Project-wide | `/docs/adr/hexagonal-architecture.md` |
| Listener (side effects) | `core/{domain}/listeners/` | `/docs/adr/core/listener-pattern.md` |
| Repository | `core/_ports_/`, `infra/*-repository/` | `/docs/adr/core/repository-pattern.md` |
| View Model | `ui/screens/*/*.view-model.ts` | `/docs/adr/ui/view-model-pattern.md` |
| Data Builder | `tests/builders/` | `/docs/adr/testing/data-builder-pattern.md` |
| Fixture | `tests/fixtures/` | `/docs/adr/testing/fixture-pattern.md` |

## Domains

- **auth** - Firebase authentication, user sessions
- **block-session** - Timed focus sessions with start/end lifecycle
- **blocklist** - Collections of sirens, can be shared across sessions
- **siren** - Individual block targets (apps, websites, keywords)

## Testing

Tests live alongside source in `*.spec.ts` files. Use `createTestStore()` from `core/_tests_/` with fake dependencies.
See `/docs/adr/testing/` for patterns: data builders, fixtures, stub vs fake guidelines.

## Finding Things

See [CODEBASE-NAVIGATION.md](./CODEBASE-NAVIGATION.md) for:
- Naming rules (filename → export name mappings)
- File locations by concept
- Example files to copy from
- Checklists for adding usecases, selectors, listeners, etc.
- Content search patterns and cross-references

# TiedSiren51

React Native app blocker with device sync (Expo, Firebase Auth, PowerSync, Kotlin native modules for Android AccessibilityService). Users create "sirens" (apps/websites/keywords), organize them into blocklists, and run timed block sessions.

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

## Related Expo Modules

Custom native modules in sibling repositories (cloned to parent directory):

| Module | Purpose |
|--------|---------|
| [expo-accessibility-service](https://github.com/amehmeto/expo-accessibility-service) | Android AccessibilityService for app/website detection |
| [expo-foreground-service](https://github.com/amehmeto/expo-foreground-service) | Persistent foreground service for background blocking |
| [expo-list-installed-apps](https://github.com/amehmeto/expo-list-installed-apps) | Query installed apps on device |
| [tied-siren-blocking-overlay](https://github.com/amehmeto/tied-siren-blocking-overlay) | Full-screen overlay displayed when blocked content detected |

## Domains

- **auth** - Firebase authentication, user sessions
- **block-session** - Timed focus sessions with start/end lifecycle
- **blocklist** - Collections of sirens, can be shared across sessions
- **siren** - Individual block targets (apps, websites, keywords)

## ADR Reference

**Read relevant ADRs before implementing.** ADRs contain naming conventions, patterns, and examples that must be followed:

| When writing... | Location | Read first |
|-----------------|----------|------------|
| Architectural changes | Project-wide | `/docs/adr/hexagonal-architecture.md` |
| Listeners | `core/{domain}/listeners/` | `/docs/adr/core/listener-pattern.md` |
| Repositories | `core/_ports_/`, `infra/*-repository/` | `/docs/adr/core/repository-pattern.md` |
| View models | `ui/screens/*/*.view-model.ts` | `/docs/adr/ui/view-model-pattern.md` |
| Tests & Fixtures | `tests/fixtures/` | `/docs/adr/testing/fixture-pattern.md` |
| Test doubles (stubs/fakes) | `tests/` | `/docs/adr/testing/stub-vs-fake-implementations.md` |
| Data builders | `tests/builders/` | `/docs/adr/testing/data-builder-pattern.md` |

## Commands

```bash
npm test              # Run tests (watch mode)
npm run lint          # TypeScript + ESLint + Prettier
npm run lint:fix      # Auto-fix lint issues
npx prisma generate   # Regenerate Prisma client after schema changes

# Quick package.json inspection
jq '.scripts' package.json        # View npm scripts (alias: jqs)
jq '.dependencies' package.json   # View dependencies (alias: jqd)
jq '.devDependencies' package.json  # View devDependencies (alias: jqdd)
```

## Branch & PR Hygiene

- Each GitHub issue gets its own branch and PR. Never combine features from different issues into one PR.
- Before committing, verify you are on the correct branch for the current task.
- Never bypass or disable git hooks without explicit user permission.

## Git Hooks

Three Husky hooks run automatically during the commit-push cycle:

**Pre-commit** (`git commit`):
- Blocks commits to `main`/`demo` branches
- Runs `tsc --noEmit` (full project type check)
- Runs lint-staged: ESLint fix + Prettier fix on staged `.ts/.tsx/.js/.json` files, remark on `.md`, shell linter on `.sh`, Prisma validation on `schema.prisma`

**Pre-push** (`git push`):
- Prompts for e2e test confirmation (skip with `SKIP_E2E_CHECK=true`)
- Blocks direct push to `main`/`demo`
- Validates branch naming convention (e.g. `feat/TS267-description`)
- Checks for uncommitted files
- Runs `expo doctor`
- Runs `npm run test:affected` (vitest on changed files only)
- Detects merge conflicts with `main` via `git merge-tree`

**Post-push** (after successful push):
- Polls GitHub Actions CI status via `scripts/ci-watch.sh` (mandatory when `CLAUDE_CODE=1`)
- Auto-updates PR description on CI success
- See [docs/CI-WATCH.md](./docs/CI-WATCH.md) for env var configuration

## Workflow

1. **When you believe you're done with a task, run `/commit-push`** to commit all changes and push to remote. Do not ask for permission—just do it.
2. **After CI passes, update the PR description** to accurately reflect all changes made.

**Efficiency:** All tests and lint rules run in CI regardless. Use linter and unit tests **surgically** on modified files only to validate changes quickly — avoid running the full suite locally. After pushing, always wait for the CI result before considering the task complete.

## Anti-patterns

**NEVER import from `infra/` in `core/`.** Core defines ports; Infra implements them. Dependency inversion is mandatory.

**NEVER put business logic in React components.** Logic belongs in Redux slices, use cases, or listeners. Components consume view models.

**NEVER use `switch` statements.** ESLint forbids them - use object maps or if/else chains.

**NEVER use type assertions (`as Type`) for branded types.** Use type guards (`isX()`) or assertion functions (`assertX()`) instead. See `/docs/adr/conventions/type-guards-for-branded-types.md`.

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

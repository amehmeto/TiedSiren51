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

## Git Hooks Setup

The project uses custom git hooks for CI monitoring. These hooks are not tracked by git and must be set up manually in each clone.

**Required hooks** (create in `.git/hooks/`):

1. **reference-transaction** - Detects when current branch's remote ref is updated after push
2. **post-push** - Triggered by reference-transaction to run CI watch

**Setup commands:**

```bash
# Create reference-transaction hook
cat > .git/hooks/reference-transaction << 'EOF'
#!/usr/bin/env bash
set -euo pipefail
current_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
if [[ -z "$current_branch" || "$current_branch" == "HEAD" ]]; then
  exit 0
fi
while read -r oldvalue newvalue refname; do
  if [[ "$1" == "committed" ]] && [[ "$refname" == "refs/remotes/origin/$current_branch" ]]; then
    if [[ -x "$(dirname "$0")/post-push" ]]; then
      "$(dirname "$0")/post-push"
    fi
    break
  fi
done
EOF
chmod +x .git/hooks/reference-transaction

# Create post-push hook
cat > .git/hooks/post-push << 'EOF'
#!/usr/bin/env bash
set -euo pipefail
echo "Push completed! Now watching CI..."
REPO_ROOT="$(git rev-parse --show-toplevel)"
if [[ -x "$REPO_ROOT/scripts/ci-watch.sh" ]]; then
  "$REPO_ROOT/scripts/ci-watch.sh"
fi
EOF
chmod +x .git/hooks/post-push
```

**Environment variables for `scripts/ci-watch.sh`:**

| Variable | Default | Description |
|----------|---------|-------------|
| `CI_WATCH_EXCLUDED_JOBS` | `build` | Comma-separated list of jobs to exclude from CI status |

The script polls GitHub Actions, verifies the workflow matches the current commit SHA, and reports results.

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

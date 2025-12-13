# Reusable Components Inventory

Components from this codebase that can be extracted for any new project.

## Domains

| Domain | Files | Notes |
|--------|-------|-------|
| **Auth** | `core/auth/` | Sign-in/up, logout, user state, listeners |
| **Logger** | `core/_ports_/logger.ts`, `infra/logger/` | In-memory + Sentry implementations |

## Infrastructure Patterns

| Component | Files | Notes |
|-----------|-------|-------|
| **Abstract Repository** | `infra/__abstract__/in-memory.repository.ts` | Generic CRUD base class |
| **Date Provider** | `core/_ports_/port.date-provider.ts`, `infra/date-provider/` | Testable time abstraction |
| **Fake Implementations** | `infra/*/fake.*.ts` | Test doubles for all ports |

## Testing Utilities

| Component | Files | Notes |
|-----------|-------|-------|
| **Test Store Factory** | `core/_tests_/createTestStore.ts` | DI-based store creation |
| **State Builder** | `core/_tests_/state-builder.ts` | Fluent test state construction |
| **Data Builders** | `core/_tests_/data-builders/` | Faker-based entity factories |

## Configuration Files

| File | Reusability |
|------|-------------|
| `.prettierrc.json` | 100% - copy as-is |
| `.npmrc` | 100% - copy as-is |
| `.nvmrc` | 100% - update version |
| `.releaserc.json` | 100% - copy as-is |
| `tsconfig.json` | 90% - update path aliases |
| `vitest.config.js` | 80% - update thresholds |
| `.eslintrc.cjs` | 70% - remove React Native rules |

## Scripts

| Script | Location |
|--------|----------|
| Coverage tracking | `scripts/track-coverage.js` |
| Coverage comparison | `scripts/compare-coverage.cjs` |
| Branch name validation | `.husky/scripts/branch-name-check.sh` |
| Push guards | `.husky/scripts/` |

## ESLint Rules (Generic)

| Rule | Purpose |
|------|---------|
| `expect-separate-act-assert` | AAA test structure |
| `time-constant-multiplication` | No magic numbers in time |
| `try-catch-isolation` | Focused error handling |
| `core-test-file-naming` | Test naming conventions |
| `require-colocated-test` | Tests next to source |

## Architecture

- Clean Architecture folder structure (`core/`, `infra/`, `ui/`)
- Ports/Adapters pattern (`core/_ports_/`)
- Redux Toolkit with dependency injection
- Listener pattern for side effects

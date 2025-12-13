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
| **Notification Service** | `core/_ports_/notification.service.ts`, `infra/notification-service/` | Push notifications |
| **Background Task Service** | `core/_ports_/background-task.service.ts`, `infra/background-task-service/` | Background processing |
| **Database Service** | `core/_ports_/database.service.ts`, `infra/database-service/` | DB abstraction |
| **Fake Implementations** | `infra/*/fake.*.ts` | Test doubles for all ports |

## Utilities

| Utility | File | Notes |
|---------|------|-------|
| **Time Utils** | `core/__utils__/time.utils.ts` | Formatting, calculations |
| **Time Constants** | `core/__constants__/time.ts` | SECOND, MINUTE, HOUR, DAY |
| **Exhaustive Guard** | `core/__utils__/exhaustive-guard.ts` | TypeScript switch safety |

## Redux Patterns

| Pattern | File | Notes |
|---------|------|-------|
| **createAppThunk** | `core/_redux_/create-app-thunk.ts` | Typed thunk with DI |
| **createStore** | `core/_redux_/createStore.ts` | Store factory with deps |
| **registerListeners** | `core/_redux_/registerListeners.ts` | Side-effect listeners |
| **rootReducer** | `core/_redux_/rootReducer.ts` | Reducer composition |

## UI Patterns

| Pattern | Files | Notes |
|---------|-------|-------|
| **Zod Schemas** | `ui/auth-schemas/`, `ui/screens/*/schemas/` | Form validation |
| **View Models** | `*.view-model.ts` | Screen logic separation |
| **useTick** | `ui/hooks/useTick.ts` | Timer/interval hook |
| **useAppForeground** | `ui/hooks/useAppForeground.ts` | App state hook |

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

## GitHub Workflows

| Workflow | File | Notes |
|----------|------|-------|
| **PR Validation** | `.github/workflows/cerberus.yml` | Lint, test, coverage, build |
| **Release** | `.github/workflows/hades.yml` | Semantic release, changelog |
| **Path Filter** | `.github/workflows/path-filter.yml` | Conditional job execution |

## Architecture

- Clean Architecture folder structure (`core/`, `infra/`, `ui/`)
- Ports/Adapters pattern (`core/_ports_/`)
- Redux Toolkit with dependency injection
- Listener pattern for side effects

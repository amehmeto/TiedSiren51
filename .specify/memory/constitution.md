<!--
SYNC IMPACT REPORT
==================
Version Change: 1.0.0 → 1.0.1 (PATCH - ADR alignment corrections)
Ratification Date: 2025-01-24
Last Amended: 2025-01-24

Modified Principles:
  - Section V: Port interface names corrected (removed I-prefix)
  - Section V: Added missing port interfaces (SirenTier, SirenLookout)
  - Architectural Standards: Added reference to Standalone Expo Modules ADR

Added Sections: N/A
Removed Sections: N/A

Templates Requiring Updates: None (templates already correct)

ADR Alignment Changes:
  ✅ Aligned with port-naming-convention.md (no I-prefix)
  ✅ Aligned with hexagonal-architecture.md (complete port list)
  ✅ Added reference to standalone-expo-modules.md

Follow-up TODOs: None
-->

# TiedSiren51 Constitution

## Core Principles

### I. Hexagonal Architecture (Ports & Adapters)

The application MUST maintain strict layered separation with dependencies pointing inward:

**Layer Structure:**
- **UI Layer** (`/app`, `/ui`): Expo Router routing, design system, screens, view models. Depends on Core.
- **Core Layer** (`/core`): Business logic, Redux state management, domain models organized by feature (auth, block-session, blocklist, siren). Port interfaces in `/core/_ports_/`. Independent of UI and Infra except for conscious Redux coupling.
- **Infrastructure Layer** (`/infra`): Adapter implementations for ports, repositories (Prisma), external services (Firebase, Expo), test doubles (fakes/stubs). Depends on Core ports.

**Dependency Flow:** UI → Core ← Infra. Core NEVER depends on UI or Infra directly, only through port interfaces.

**Rationale:** Enables independent testing with fake implementations, flexibility to swap infrastructure (proven during PouchDB → Prisma migration), clear separation of concerns, and parallel team development.

### II. Redux Toolkit for State Management

The Core layer MUST use Redux Toolkit for all business logic state management:

- **Domain-based slices** in `/core/{domain}/{domain}.slice.ts` containing reducers for synchronous state updates
- **Entity Adapters** (`createEntityAdapter`) for normalized collections to prevent data duplication
- **Async Thunks** (`createAppAsyncThunk`) for all async operations, with dependencies injected via `extraArgument`
- **Listener Pattern** in `/core/{domain}/listeners/` for cross-domain side effects and state change reactions
- **Typed selectors** with memoization for performance

**Rationale:** Provides predictable state management, excellent debugging via Redux DevTools, built-in normalization support, and proven testability. The conscious coupling to Redux is justified by its central role in business logic and extensive ecosystem support.

### III. Testing & Quality

**Test-Driven Development (RECOMMENDED):**
- Tests written before implementation when explicitly requested in specifications
- Red-Green-Refactor cycle for new features requiring tests

**Test Doubles Strategy:**
- **Fakes**: Functional in-memory implementations (e.g., `FakeAuthGateway`, `FakeDataBlockSessionRepository`)
- **Stubs**: Minimal fixed-response implementations (e.g., `StubDateProvider`, `StubDatabaseService`)
- Test doubles MUST implement the same port interfaces as production code

**Coverage Tracking:**
- Current coverage target: **42.1%** (tracked via `npm run test:cov:track`)
- PR coverage comparison automated via GitHub Actions
- Coverage history maintained locally via `scripts/track-coverage.js`

**Quality Gates:**
- Git pre-commit hook: Linting and type checking MUST pass
- Git pre-push hook: All tests MUST pass
- No commits with failing tests or type errors

**Rationale:** Hexagonal architecture enables comprehensive testing via dependency injection. Quality gates prevent regressions. Coverage tracking ensures visibility into test completeness.

### IV. Type Safety & Correctness

**TypeScript Strictness:**
- Strict mode enabled (`tsconfig.json`)
- No `any` types except when interfacing with untyped libraries
- Full type inference leveraged across Redux (state, actions, thunks)

**Static Analysis:**
- ESLint with strict rules (`eslint-plugin-sonarjs`, `eslint-plugin-react-hooks`)
- Custom local rules via `eslint-plugin-local-rules`
- Prettier for consistent formatting
- No switch statements rule enforced (`eslint-plugin-no-switch-statements`)

**Rationale:** Type safety catches errors at compile time rather than runtime. Strict linting enforces consistent patterns across the codebase.

### V. Dependency Injection via Factories

**Factory Pattern for Dependencies:**
- Production dependencies: `/ui/dependencies.ts` creates real implementations
- Test dependencies: `/core/_tests_/createTestStore.ts` creates test doubles
- Dependencies injected into Redux store via thunk `extraArgument`
- Full TypeScript inference for all dependencies

**Port Interfaces:**
All external dependencies MUST be defined as port interfaces in `/core/_ports_/`:
- `AuthGateway` - Authentication operations
- `BlockSessionRepository` - Block session persistence
- `BlocklistRepository` - Blocklist persistence
- `SirensRepository` - Siren data access
- `SirenTier` - Platform-specific blocking behavior
- `SirenLookout` - App launch detection
- `NotificationService` - Push notifications
- `DatabaseService` - Database initialization
- `DateProvider` - Time/date operations
- `BackgroundTaskService` - Background task scheduling

**Note**: Port interfaces follow TypeScript convention with no I-prefix. See ADR: [Port Naming Convention](/docs/adr/core/port-naming-convention.md) for details.

**Environment Switching:**
- E2E tests (`EXPO_PUBLIC_E2E` flag) use fake implementations
- Production uses real implementations (Firebase, Prisma, Expo services)

**Rationale:** Explicit, type-safe dependency management without IoC container complexity. Enables easy test double substitution. No "magic" behavior—dependencies are traceable from factory to usage.

## Architectural Standards

### Domain Organization

Features MUST be organized by domain within each layer:
- `/core/{domain}/` - Business logic slice, entities, selectors, usecases, listeners
- `/infra/{domain}-repository/` or `/infra/{domain}-service/` - Adapter implementations
- `/ui/screens/{domain}/` - Domain-specific UI components

Current domains: `auth`, `block-session`, `blocklist`, `siren`, `remote-device`

### File Naming Conventions

- Slices: `{domain}.slice.ts`
- Entities: `{domain}.ts` (e.g., `block.session.ts`)
- Repositories: `{implementation}{Domain}Repository.ts` (e.g., `PrismaBlockSessionRepository.ts`, `FakeDataBlockSessionRepository.ts`)
- Services: `{implementation}{Service}.ts` (e.g., `RealNotificationService.ts`, `StubDatabaseService.ts`)
- Tests: `{filename}.test.ts` or `{filename}.spec.ts`

### Data Persistence

- Primary database: **SQLite via Prisma** (`@prisma/react-native`)
- Schema defined in `prisma/schema.prisma`
- Migrations: `npx prisma migrate dev`
- Code generation: `npx prisma generate` (run after schema changes)

### Expo Module Standards

All Expo modules MUST be standalone, live in separate repositories, and be decoupled from TiedSiren business logic:

- **Separate Repository**: Each module in its own git repository (e.g., `expo-blocking-overlay`, `expo-accessibility-service`)
- **External Dependency**: Consumed via package.json (git reference or npm package)
- **Reusable Design**: Modules provide primitives, not TiedSiren-specific logic
- **No Internal Modules**: Never inside TiedSiren51 repository structure

See ADR: [Standalone Expo Modules](/docs/adr/infrastructure/standalone-expo-modules.md) for detailed guidance.

### Technology Stack

**Runtime:**
- React Native 0.74.5
- Expo SDK ~51
- Node.js ≥18.0.0, npm ≥8.0.0

**State Management:**
- Redux Toolkit ^2.2.5
- React Redux ^9.1.2

**Authentication:**
- Firebase ^11.9.1
- Expo Apple Authentication
- React Native Google Sign-In

**Testing:**
- Vitest ^1.6.0 (unit/integration)
- c8 for coverage
- Maestro for E2E tests

**Build & Deployment:**
- EAS Build for iOS/Android
- Expo prebuild for native configuration

## Development Workflow

### Git Workflow

**Branch Naming:**
- Feature branches: `feature/{feature-name}` or `###-feature-name`
- Bug fixes: `fix/{issue-description}`
- Documentation: `docs/{description}`

**Commit Standards:**
- Conventional commits encouraged: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- No commits without passing pre-commit hooks (lint + typecheck)

**Pull Request Requirements:**
- All tests pass
- Coverage comparison comment generated automatically
- Descriptive PR title and summary
- Review required before merge

### Local Development Commands

- `npm start` - Start Expo dev server
- `npm run android` / `npm run ios` - Run on platform
- `npm run lint` - Check linting and types
- `npm run lint:fix` - Auto-fix linting and formatting
- `npm test` - Run tests in watch mode
- `npm run test:prepush` - Run all tests once (pre-push hook)
- `npm run test:cov` - Generate coverage report
- `npm run test:cov:track` - Track coverage history locally

### Adding New Features

**Step 1: Define Port Interface (if needed)**
- Add interface to `/core/_ports_/`
- Define contract for external dependency

**Step 2: Implement Core Logic**
- Create domain slice in `/core/{domain}/`
- Use entity adapter if managing collections
- Implement async thunks for use cases in `/core/{domain}/usecases/`
- Add selectors in `/core/{domain}/selectors/`
- Add listeners if cross-domain effects needed

**Step 3: Implement Infrastructure**
- Create adapter implementation in `/infra/`
- Create fake/stub for testing
- Wire dependencies in `/ui/dependencies.ts` (production)
- Wire test doubles in `/core/_tests_/createTestStore.ts`

**Step 4: Build UI**
- Create view model if complex state mapping needed
- Build screens in `/ui/screens/{domain}/`
- Use design system components from `/ui/design-system/`
- Add routing in `/app/` via Expo Router

**Step 5: Testing**
- Unit test reducers and selectors
- Integration test async thunks with fake dependencies
- E2E test critical user flows with Maestro

## Governance

### Amendment Process

1. **Proposal:** Architectural changes MUST be documented as ADRs in `/docs/adr/` before implementation
2. **Review:** ADRs MUST include Status (Proposed/Accepted/Superseded), Context, Decision, Consequences, Alternatives Considered
3. **Migration:** Breaking architectural changes MUST include migration plan for existing code
4. **Approval:** Constitution amendments require team consensus and update to this document

### Compliance Review

- **PR Reviews:** All PRs MUST verify compliance with architectural principles
- **Complexity Justification:** Violations of principles (e.g., additional layers, non-standard patterns) MUST be explicitly justified in plan documentation
- **Quality Gates:** Pre-commit and pre-push hooks enforce type checking, linting, and testing requirements

### Versioning Policy

This constitution follows semantic versioning:
- **MAJOR:** Backward-incompatible changes (e.g., removing a principle, changing architectural pattern)
- **MINOR:** New principles or sections added, material expansions to guidance
- **PATCH:** Clarifications, wording improvements, typo fixes

### Runtime Development Guidance

For detailed development workflows and slash command usage, refer to:
- `.claude/commands/speckit.*.md` - Speckit workflow commands
- `.specify/templates/` - Feature planning and task templates

**Version**: 1.0.1 | **Ratified**: 2025-01-24 | **Last Amended**: 2025-01-24

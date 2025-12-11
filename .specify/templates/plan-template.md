# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]  
**Primary Dependencies**: [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]  
**Storage**: [if applicable, e.g., PostgreSQL, CoreData, files or N/A]  
**Testing**: [e.g., pytest, XCTest, cargo test or NEEDS CLARIFICATION]  
**Target Platform**: [e.g., Linux server, iOS 15+, WASM or NEEDS CLARIFICATION]
**Project Type**: [single/web/mobile - determines source structure]  
**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]  
**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]  
**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

This feature MUST comply with the following constitutional principles:

### I. Hexagonal Architecture Compliance
- [ ] Core business logic organized in `/core/{domain}/`
- [ ] Port interfaces defined for external dependencies in `/core/_ports_/`
- [ ] Adapters implemented in `/infra/{domain}-repository/` or `/infra/{domain}-service/`
- [ ] UI components in `/ui/screens/{domain}/` or `/app/`
- [ ] Dependencies flow: UI → Core ← Infra (Core never imports from UI or Infra)

### II. Redux Toolkit State Management
- [ ] Domain slice created in `/core/{domain}/{domain}.slice.ts`
- [ ] Entity adapter used for collections (if applicable)
- [ ] Async thunks use `createAppAsyncThunk` with typed dependencies
- [ ] Selectors created with memoization
- [ ] Listeners registered for cross-domain side effects (if needed)

### III. Testing & Quality
- [ ] Tests written if explicitly requested in specification
- [ ] Fake/stub implementations created for new ports
- [ ] Test coverage tracked and PR comparison enabled
- [ ] Pre-commit/pre-push hooks will enforce quality gates

### IV. Type Safety
- [ ] All code uses strict TypeScript (no `any` except for untyped libraries)
- [ ] ESLint rules followed (no switch statements, etc.)
- [ ] Prettier formatting applied

### V. Dependency Injection
- [ ] New dependencies added to `Dependencies` type if needed
- [ ] Production implementations wired in `/ui/dependencies.ts`
- [ ] Test doubles wired in `/core/_tests_/createTestStore.ts`
- [ ] Dependencies accessed via thunk `extraArgument`

**Complexity Violations:** (Fill only if violations exist and require justification)

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Expand the structure below with specific paths for this feature.
  Add new domain directories if needed under core/, infra/, and ui/screens/.
-->

```text
TiedSiren51/ (React Native + Expo mobile app with Hexagonal Architecture)

app/                          # Expo Router file-based routing (UI Layer)
├── (auth)/                   # Authentication screens
├── (tabs)/                   # Tab-based screens
└── _layout.tsx               # Root layout configuration

ui/                           # UI Layer
├── design-system/            # UI components and styling
├── screens/{domain}/         # Domain-specific screen components
├── hooks/                    # UI-related hooks
├── navigation/               # Navigation utilities
└── dependencies.ts           # Production dependency factory

core/                         # Business Logic Layer (Redux Toolkit)
├── auth/                     # Authentication domain
├── block-session/            # Block session domain
├── blocklist/                # Blocklist domain
├── siren/                    # Siren domain
├── _ports_/                  # Port interfaces (IAuthGateway, IRepository, etc.)
├── _redux_/                  # Redux configuration (store, thunks, listeners)
└── _tests_/                  # Test utilities (createTestStore, fakes/stubs)

infra/                        # Infrastructure Layer (Adapters)
├── auth-gateway/             # Firebase authentication
├── block-session-repository/ # Prisma block session persistence
├── blocklist-repository/     # Prisma blocklist persistence
├── sirens-repository/        # Prisma sirens persistence
├── notification-service/     # Expo notifications
├── database-service/         # Database initialization
└── date-provider/            # Date/time utilities

prisma/
├── schema.prisma             # Database schema
└── migrations/               # Database migrations
```

**Structure Decision**: TiedSiren51 follows Hexagonal Architecture with three layers:
- UI Layer: `/app` (routing) + `/ui` (components/screens)
- Core Layer: `/core` (business logic with Redux Toolkit)
- Infrastructure Layer: `/infra` (adapters for external services)

New features should follow domain-based organization within each layer.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

# Implementation Plan: Android Blocking Overlay Launcher

**Branch**: `feat/display-overlay-over-detected-siren` | **Date**: 2025-01-24 | **Spec**: [spec.md](./spec.md)
**GitHub Issue**: [#102](https://github.com/amehmeto/TiedSiren51/issues/102)
**Dependencies**: [#97](https://github.com/amehmeto/TiedSiren51/issues/97) (App Launch Monitoring), [#101](https://github.com/amehmeto/TiedSiren51/issues/101) (Blocking Decision Logic)
**Related**: [#103](https://github.com/amehmeto/TiedSiren51/issues/103) (Accessibility Permission UX), [#95](https://github.com/amehmeto/TiedSiren51/issues/95) (expo-accessibility-service - COMPLETED)

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.
**Sync Status**: ✅ Complete - Planning docs and GitHub Issue #102 are fully synchronized.

## Summary

Implement `AndroidSirenTier`, an Android-specific implementation of the `SirenTier` port interface that uses a standalone Expo module to display blocking overlays.

**Architecture**:
- `AndroidSirenTier` (in `/infra/siren-tier/`) implements the `SirenTier` interface
- Uses `expo-blocking-overlay` module (separate repository: `github.com/amehmeto/expo-blocking-overlay`)
- The Expo module exposes `showOverlay(packageName, blockUntil)` to JavaScript
- Module is consumed as external dependency via package.json (git reference or npm)

**Behavior**:
- Launches fullscreen Android Activity within 200ms when `SirenTier.block()` is called
- Overlay cannot be dismissed by back button (non-dismissible via system navigation)
- Displays "Close" button that redirects user to Android home screen (not back to blocked app)
- Prevents user interaction with blocked apps underneath

**Design Philosophy**: The Expo module is decoupled from TiedSiren business logic, making it reusable. See ADR: [Standalone Expo Modules](../../../docs/adr/infrastructure/standalone-expo-modules.md).

## Technical Context

**Language/Version**: TypeScript ~5.3.3, Kotlin (for native Android module)
**Primary Dependencies**: Expo SDK ~51, React Native 0.74.5, Expo Modules API, Android SDK API 26+
**Storage**: N/A (no data persistence required for this feature)
**Testing**: Vitest ^1.6.0 (TypeScript), Android instrumentation tests (native), physical device testing required
**Target Platform**: Android 8.0+ (API level 26+), physical devices only (AccessibilityService cannot be tested on emulators)
**Project Type**: Mobile (React Native + Expo with native Android module)
**Performance Goals**: Overlay launch <200ms, no memory leaks during continuous monitoring
**Constraints**: Must work across manufacturers (Samsung, OnePlus, Xiaomi, Google), overlay cannot be dismissed by back button, must not crash on invalid inputs
**Scale/Scope**: Single standalone Expo module (separate repo), one exposed method (`showOverlay`), one native Android Activity, one infrastructure adapter (`AndroidSirenTier`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

This feature MUST comply with the following constitutional principles:

### I. Hexagonal Architecture Compliance
- [x] Core business logic organized in `/core/{domain}/` - Blocking decision logic remains in `/core/siren/` or `/core/block-session/`
- [x] Port interfaces defined for external dependencies in `/core/_ports_/` - Use existing `SirenTier` port interface (no new port needed)
- [x] Adapters implemented in `/infra/{domain}-repository/` or `/infra/{domain}-service/` - Create `AndroidSirenTier` in `/infra/siren-tier/` (implements `SirenTier`)
- [x] UI components in `/ui/screens/{domain}/` or `/app/` - N/A: Overlay is native Android Activity (no React Native UI)
- [x] Dependencies flow: UI → Core ← Infra - YES: Core calls `SirenTier.block()` via port, `AndroidSirenTier` implements using native module

### II. Redux Toolkit State Management
- [x] Domain slice created in `/core/{domain}/{domain}.slice.ts` - Use existing `/core/siren/` slice (no changes needed)
- [ ] Entity adapter used for collections (if applicable) - N/A: No collections to manage
- [x] Async thunks use `createAppAsyncThunk` with typed dependencies - Use existing thunks or create new thunk for blocking
- [x] Selectors created with memoization - Use existing selectors (no overlay-specific state needed)
- [x] Listeners registered for cross-domain side effects (if needed) - YES: Existing listener triggers `SirenTier.block()` when blocked app detected

### III. Testing & Quality
- [x] Tests written if explicitly requested in specification - Unit tests for `AndroidSirenTier` implementation
- [x] Fake/stub implementations created for new ports - Use existing `InMemorySirenTier` for testing (no new test double needed)
- [x] Test coverage tracked and PR comparison enabled - Automatic via existing setup
- [x] Pre-commit/pre-push hooks will enforce quality gates - Automatic via Husky

### IV. Type Safety
- [x] All code uses strict TypeScript (no `any` except for untyped libraries) - YES
- [x] ESLint rules followed (no switch statements, etc.) - YES
- [x] Prettier formatting applied - YES

### V. Dependency Injection
- [x] New dependencies added to `Dependencies` type if needed - NO: `sirenTier: SirenTier` already exists in Dependencies type
- [x] Production implementations wired in `/ui/dependencies.ts` - Wire `AndroidSirenTier` for Android, keep `InMemorySirenTier` for iOS/Web fallback
- [x] Test doubles wired in `/core/_tests_/createTestStore.ts` - Use existing `InMemorySirenTier` for tests (already wired)
- [x] Dependencies accessed via thunk `extraArgument` - YES: Access via `extra.sirenTier.block(packageName)`

**Complexity Violations:** None - This feature follows hexagonal architecture perfectly. The overlay is an Android-specific implementation of the existing `SirenTier` port. No new abstractions needed. Multi-platform design maintained: same interface, different implementations per platform.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── functional-overview.md # Phase 1 output (non-technical overview)
├── native-api/          # Phase 1 output (external module API docs)
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
├── _ports_/                  # Port interfaces (AuthGateway, SirenTier, Repository, etc.)
├── _redux_/                  # Redux configuration (store, thunks, listeners)
└── _tests_/                  # Test utilities (createTestStore, fakes/stubs)

infra/                        # Infrastructure Layer (Adapters)
├── auth-gateway/             # Firebase authentication
├── block-session-repository/ # Prisma block session persistence
├── blocklist-repository/     # Prisma blocklist persistence
├── sirens-repository/        # Prisma sirens persistence
├── siren-tier/               # Siren blocking implementations (AndroidSirenTier, InMemorySirenTier)
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

# Architecture Decision Records (ADR)

This directory contains Architecture Decision Records for TiedSiren51, documenting significant architectural and design decisions made throughout the project.

## What is an ADR?

An Architecture Decision Record captures a significant architectural decision along with its context and consequences. Each ADR describes:
- The context and problem being addressed
- The decision that was made
- The consequences (positive, negative, and neutral)
- Alternatives that were considered

## Navigation

### By Architectural Layer

Directory structure mirrors the three-layer architecture (UI-Core-Infrastructure separation).

#### UI Layer (`ui/`)
Presentation layer: components, screens, design system, routing.

- [Design System Principles](ui/design-system-principles.md)
- [View Model Pattern](ui/view-model-pattern.md)
- [Expo Router File-Based Routing](ui/expo-router-file-based.md)
- [Minimize useEffect Hook Usage](ui/minimize-useeffect-usage.md)
- [Redux Over Context for UI State](ui/redux-over-context-for-ui-state.md)
- [No Selector Prop Drilling](ui/no-selector-prop-drilling.md)
- [Centralized Services Initialization](services-initialization.md)

#### Core Layer (`core/`)
Business logic: domain patterns, state management, use cases.

**Architectural Patterns:**
- [Hexagonal Architecture](hexagonal-architecture.md)
- [Dependency Injection Pattern](core/dependency-injection-pattern.md)
- [Repository Pattern](core/repository-pattern.md)
- [Listener Pattern for Side Effects](core/listener-pattern.md)

**State Management:**
- [Redux Toolkit for Business Logic](core/redux-toolkit-for-business-logic.md)
- [Entity Adapter Normalization](core/entity-adapter-normalization.md)
- [Adapters Encapsulated in Selectors](core/adapters-encapsulated-in-selectors.md)
- [Typed Async Thunk Factory](core/typed-async-thunk-factory.md)
- [Domain-Based Slices](core/domain-based-slices.md)

#### Infrastructure Layer (`infrastructure/`)
External services, databases, adapters, platform-specific implementations.

**Data Persistence:**
- [Prisma ORM with SQLite](infrastructure/prisma-orm-sqlite.md)
- [Abandon PouchDB](infrastructure/abandon-pouchdb.md)
- [Platform-Specific Database Paths](infrastructure/platform-specific-db-paths.md)
- [Local-First Architecture](infrastructure/local-first-architecture.md)

**Authentication:**
- [Firebase Authentication](infrastructure/firebase-authentication.md)

**Notifications & Background Tasks:**
- [Expo Notifications](infrastructure/expo-notifications.md)
- [Native Blocking Scheduler](infrastructure/native-blocking-scheduler.md)
- ~~[Expo Background Fetch](infrastructure/expo-background-fetch.md)~~ *(Superseded by Native Blocking Scheduler)*

**Platform Adapters:**
- [Expo List Installed Apps](infrastructure/expo-list-installed-apps.md)
- [Date Provider Pattern](infrastructure/date-provider-pattern.md)
- [Foreground Service](infrastructure/foreground-service.md)
- [SirenTier Orchestrator Pattern](infrastructure/siren-tier-orchestrator.md)

### Cross-Cutting Concerns

#### Testing (`testing/`)
Testing strategies, tools, and patterns across all layers.

- [Vitest Over Jest](testing/vitest-over-jest.md)
- [Data Builder Pattern](testing/data-builder-pattern.md)
- [Fixture Pattern for Test Data](testing/fixture-pattern.md)
- [Stub vs Fake Implementations](testing/stub-vs-fake-implementations.md)
- [Test Store Factory](testing/test-store-factory.md)
- [Exclude Prisma Integration Tests](testing/exclude-prisma-integration-tests.md)
- [Maestro for E2E Testing](testing/maestro-for-e2e.md)
- [Coverage Tracking and History](testing/coverage-tracking.md)

#### Conventions (`conventions/`)
Coding conventions and style decisions across all layers.

- [Class-Scoped Constants](conventions/class-scoped-constants.md)
- [Developer Tooling](conventions/developer-tooling.md)
- [Infrastructure Error Handling](conventions/infra-error-handling.md)
- [No Nested Call Expressions](conventions/no-nested-call-expressions.md)
- [Remote Feature Flags](conventions/remote-feature-flags.md)
- ~~[Static Feature Flags](conventions/static-feature-flags.md)~~ *(Superseded by Remote Feature Flags)*
- [Type Guards for Branded Types](conventions/type-guards-for-branded-types.md)

## Creating a New ADR

1. Determine which layer the decision belongs to:
   - `ui/` - Presentation, components, screens, design system, routing
   - `core/` - Business logic, domain patterns, state management
   - `infrastructure/` - External services, databases, platform-specific code
   - `testing/` - Cross-cutting testing concerns
   - `conventions/` - Coding conventions and style decisions
2. Copy `template.md` to the appropriate directory
3. Name it descriptively (e.g., `graphql-api.md`)
4. Fill in all sections
5. Link it in this README under the relevant section
6. Commit and create a PR

## ADR Lifecycle

- **Proposed**: Under consideration, not yet implemented
- **Accepted**: Decision made and being/been implemented
- **Deprecated**: No longer recommended, but still in use
- **Superseded**: Replaced by a newer decision (link to the new ADR)

## References

- [Michael Nygard's ADR methodology](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- [ADR GitHub organization](https://adr.github.io/)

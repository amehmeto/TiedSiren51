# Hexagonal Architecture (Ports and Adapters)

Date: 2025-01-28

## Status

Accepted

## Context

TiedSiren51 is a React Native application with complex business logic around block sessions, blocklists, and siren management. The application needs to:

- Separate business logic from UI and infrastructure concerns
- Support multiple data persistence strategies (started with PouchDB, migrated to Prisma)
- Enable comprehensive testing with fake/stub implementations
- Maintain flexibility to swap external services (auth providers, notification services)
- Keep business logic framework-agnostic where possible

Traditional layered architecture (UI → Business Logic → Data) would tightly couple business logic to React Native and specific infrastructure choices.

## Decision

Adopt **Hexagonal Architecture** (also known as Ports and Adapters pattern) with three distinct layers:

### Layer Structure

1. **UI Layer** (`/app` and `/ui`)
   - Expo Router file-based routing in `/app`
   - Design system, screens, and components in `/ui`
   - React-specific presentation logic
   - View models to bridge Redux state and UI

2. **Core Layer** (`/core`)
   - Business logic and domain models
   - Redux Toolkit for state management (conscious coupling decision)
   - Domain-driven design with features: `auth/`, `block-session/`, `blocklist/`, `siren/`
   - Port interfaces defined in `/core/_ports_/`
   - Framework-independent except for Redux

3. **Infrastructure Layer** (`/infra`)
   - Adapter implementations for core ports
   - Repository implementations (Prisma-based)
   - External service integrations (Firebase auth, Expo notifications)
   - Database services and providers
   - Both production and test implementations (fakes/stubs)

### Dependency Flow

```
UI Layer → Core Layer ← Infra Layer
             ↓
        Ports (interfaces)
             ↑
      Infra Adapters
```

Dependencies point inward: UI and Infra depend on Core, but Core never depends on UI or Infra.

### Ports and Adapters

**Ports** (interfaces in `/core/_ports_/`):
- `AuthGateway` - Authentication operations
- `BackgroundTaskService` - Background task scheduling
- `BlockSessionRepository` - Block session persistence
- `BlocklistRepository` - Blocklist persistence
- `DatabaseService` - Database initialization
- `DateProvider` - Time/date operations
- `ForegroundService` - Android foreground service for background persistence
- `InstalledAppRepository` - Installed apps data access
- `Logger` - Logging operations
- `NotificationService` - Push notifications
- `RemoteDeviceRepository` - Remote device sync persistence
- `SirenLookout` - App launch detection
- `SirensRepository` - Siren data access
- `SirenTier` - Platform-specific blocking behavior
- `TimerRepository` - Strict mode timer persistence

**Adapters** (implementations in `/infra`):
- Production: `FirebaseAuthGateway`, `PrismaBlockSessionRepository`, `AndroidSirenTier`, `AndroidForegroundService`, `RealNotificationService`
- Testing: `FakeAuthGateway`, `FakeDataBlockSessionRepository`, `InMemorySirenTier`, `InMemoryForegroundService`, `StubDatabaseService`

**Note**: Port interfaces follow TypeScript convention with no I-prefix. See [Port Naming Convention ADR](core/port-naming-convention.md) for details.

### Dependency Injection

Dependencies are injected via a factory pattern:
- Production: `/ui/dependencies.ts` creates real implementations
- Testing: `/core/_tests_/createTestStore.ts` creates fake/stub implementations
- Dependencies passed to Redux store via thunk `extraArgument`

## Consequences

### Positive

- **Testability**: Business logic can be tested independently with fake implementations
- **Flexibility**: Easy to swap infrastructure (e.g., PouchDB → Prisma migration)
- **Clear boundaries**: Each layer has well-defined responsibilities
- **Parallel development**: Teams can work on UI, Core, and Infra independently
- **Technology agnostic core**: Business logic not tied to React Native specifics
- **Explicit dependencies**: All external dependencies visible through ports
- **Multiple implementations**: Same port can have production/test/mock implementations

### Negative

- **More files**: Ports add an interface layer, increasing file count
- **Learning curve**: Team needs to understand hexagonal concepts
- **Indirection**: Following code flow requires understanding port → adapter mapping
- **Boilerplate**: Each new external dependency requires port interface + adapter
- **Not pure hexagonal**: Core is coupled to Redux Toolkit (conscious trade-off)

### Neutral

- **Redux coupling**: Business logic lives in Redux slices rather than being framework-free
- **Testing strategy**: Requires discipline to maintain fake/stub implementations
- **Directory structure**: Three top-level directories instead of traditional structure

## Alternatives Considered

### 1. Traditional Layered Architecture
**Rejected because**: Tight coupling between layers, difficult to test business logic independently, harder to swap infrastructure.

### 2. Feature-Based Organization (No Hexagonal)
**Rejected because**: Would mix concerns within features, making infrastructure changes difficult, less testable.

### 3. Clean Architecture (Uncle Bob)
**Rejected because**: More complex with additional layers (entities, use cases, interface adapters, frameworks), overkill for mobile app size.

### 4. MVC/MVVM Only
**Rejected because**: Doesn't address infrastructure concerns, state management would be unclear, testing would be harder.

## Implementation Notes

### Key Files
- `/README.md:143-176` - Documents the architecture
- `/core/_ports_/` - All port interfaces
- `/ui/dependencies.ts` - Production dependency factory
- `/core/_tests_/createTestStore.ts` - Test dependency factory
- `/core/_redux_/createStore.ts` - Dependency injection setup

### Migration Path
- Started with basic structure
- Added ports as external dependencies were identified
- Migrated from PouchDB to Prisma cleanly due to repository abstraction

### Related ADRs
- [Port Naming Convention](core/port-naming-convention.md) - No I-prefix for port interfaces
- [Redux Toolkit for Business Logic](core/redux-toolkit-for-business-logic.md)
- [Repository Pattern](core/repository-pattern.md)
- [Dependency Injection Pattern](core/dependency-injection-pattern.md)

## References

- [Hexagonal Architecture by Alistair Cockburn](https://alistair.cockburn.us/hexagonal-architecture/)
- [Ports and Adapters Pattern](https://herbertograca.com/2017/09/14/ports-adapters-architecture/)
- Project README: `/README.md`

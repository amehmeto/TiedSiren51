# Dependency Injection via Factory Pattern

Date: 2025-01-28

## Status

Accepted

## Context

TiedSiren51's hexagonal architecture requires injecting infrastructure dependencies into the core business logic layer:

- Repositories (BlockSession, Blocklist, Siren, RemoteDevice)
- External services (Auth, Notifications, Database)
- Utilities (Date provider, Background tasks)

Requirements:
- **Testability**: Easily swap real implementations for fakes/stubs in tests
- **Environment-specific**: Different implementations for E2E tests vs production
- **Type safety**: Dependencies should be fully typed
- **Simplicity**: Avoid over-engineering for a mobile app
- **Redux integration**: Dependencies accessible in async thunks
- **No magic**: Explicit, traceable dependency wiring

Options considered:
- IoC containers (InversifyJS, TSyringe)
- Service locator pattern
- Factory functions
- Manual constructor injection

## Decision

Use **Factory Pattern** with manual constructor injection for dependency management.

### Implementation

**1. Dependency Type Definitions** (`/core/_redux_/dependencies.ts`)

```typescript
export type Dependencies = {
  authGateway: IAuthGateway
  blockSessionRepository: IBlockSessionRepository
  blocklistRepository: IBlocklistRepository
  sirensRepository: ISirensRepository
  remoteDeviceRepository: IRemoteDeviceRepository
  notificationService: INotificationService
  databaseService: IDatabaseService
  dateProvider: IDateProvider
  backgroundTaskService: IBackgroundTaskService
}
```

**2. Production Factory** (`/ui/dependencies.ts`)

```typescript
const mobileDependencies: Dependencies = {
  authGateway: process.env.EXPO_PUBLIC_E2E
    ? new FakeAuthGateway()
    : new FirebaseAuthGateway(),
  blockSessionRepository: new PrismaBlockSessionRepository(),
  blocklistRepository: new PrismaBlocklistRepository(),
  sirensRepository: new PrismaSirensRepository(),
  // ... other dependencies
}

export const createMobileDependencies = () => mobileDependencies
```

**3. Test Factory** (`/core/_tests_/createTestStore.ts`)

```typescript
export const createTestStore = (
  preloadedState?: RootState,
  dependencies?: Partial<Dependencies>
) => {
  const testDependencies: Dependencies = {
    authGateway: new FakeAuthGateway(),
    blockSessionRepository: new FakeDataBlockSessionRepository(),
    dateProvider: new StubDateProvider(),
    // ... other test doubles
    ...dependencies, // Allow overrides
  }

  return createStore(testDependencies, preloadedState)
}
```

**4. Injection into Redux** (`/core/_redux_/createStore.ts`)

```typescript
export const createStore = (
  dependencies: Dependencies,
  preloadedState?: RootState
) => {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: {
          extraArgument: dependencies, // Inject here
        },
      }),
  })
}
```

**5. Usage in Async Thunks** (`/core/_redux_/create-app-thunk.ts`)

```typescript
export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState
  dispatch: AppDispatch
  extra: Dependencies // Type-safe dependency access
}>()

// Usage:
export const loadUser = createAppAsyncThunk(
  'auth/loadUser',
  async (_, { extra }) => {
    const user = await extra.authGateway.getCurrentUser()
    return user
  }
)
```

## Consequences

### Positive

- **Simplicity**: No complex IoC container to configure
- **Explicit**: Dependencies clearly visible in factory functions
- **Type-safe**: Full TypeScript inference for dependencies
- **Testability**: Easy to create test stores with fake dependencies
- **Flexibility**: Can override specific dependencies in tests
- **No magic**: Straightforward constructor calls, easy to debug
- **Environment switching**: `process.env.EXPO_PUBLIC_E2E` switches implementations
- **Zero runtime overhead**: No reflection or decoration
- **Easy to trace**: Follow dependency from factory to usage
- **Minimal dependencies**: No extra libraries needed

### Negative

- **Manual wiring**: Must manually create and wire dependencies
- **Boilerplate**: Separate factory for production vs tests
- **No automatic lifecycle**: Must manually manage singleton/transient
- **Coupling to Redux**: Dependencies tied to Redux thunk extraArgument
- **Not discoverable**: No autocomplete for available dependencies (must check type)
- **Multiple factories**: Production, test, E2E each need separate factory
- **Initialization order**: Must carefully order dependency construction

### Neutral

- **Scalability**: Works well up to ~20 dependencies, beyond that gets unwieldy
- **Convention over configuration**: Relies on team discipline

## Alternatives Considered

### 1. InversifyJS (IoC Container)
**Rejected because**:
- Overkill for mobile app with ~10 dependencies
- Decorator syntax requires experimental TypeScript features
- Adds bundle size
- "Magic" behavior harder to debug
- Learning curve for team

### 2. TSyringe (Microsoft DI)
**Rejected because**:
- Requires `reflect-metadata` polyfill (bundle size)
- Decorator-based (experimental features)
- More complexity than needed
- Smaller community than InversifyJS

### 3. Service Locator Pattern
**Rejected because**:
- Anti-pattern (hides dependencies)
- Runtime errors instead of compile-time
- Makes testing harder
- Couples code to service locator

### 4. React Context for Dependencies
**Rejected because**:
- Mixes UI concerns with business logic
- Can't access in Redux thunks easily
- Re-renders when dependencies change
- Not suitable for non-React code

### 5. Global Singletons
**Rejected because**:
- Impossible to test (can't swap implementations)
- Couples all code to specific implementations
- Shared mutable state
- Initialization race conditions

## Implementation Notes

### Key Files
- `/core/_redux_/dependencies.ts` - Type definitions
- `/ui/dependencies.ts` - Production factory
- `/core/_tests_/createTestStore.ts` - Test factory
- `/core/_redux_/createStore.ts` - Injection point
- `/core/_redux_/create-app-thunk.ts` - Typed thunk access

### Test Doubles Strategy

**Fakes**: Functional implementations for testing
- `FakeAuthGateway` - In-memory auth
- `FakeDataBlockSessionRepository` - Array-based storage

**Stubs**: Minimal implementations returning fixed data
- `StubDateProvider` - Returns controllable dates
- `StubDatabaseService` - No-op database

### Environment Switching

```typescript
// E2E tests use fakes
const authGateway = process.env.EXPO_PUBLIC_E2E
  ? new FakeAuthGateway()
  : new FirebaseAuthGateway()
```

### Adding New Dependencies

1. Add interface to `/core/_ports_/`
2. Add to `Dependencies` type
3. Create implementation in `/infra/`
4. Wire in production factory (`/ui/dependencies.ts`)
5. Wire in test factory (`/core/_tests_/createTestStore.ts`)
6. Use via `extra` argument in thunks

### Related ADRs
- [Hexagonal Architecture](../hexagonal-architecture.md)
- [Redux Toolkit for Business Logic](../state-management/redux-toolkit-for-business-logic.md)
- [Repository Pattern](repository-pattern.md)
- [Stub vs Fake Implementations](../testing/stub-vs-fake-implementations.md)

## References

- [Dependency Injection Principles](https://martinfowler.com/articles/injection.html)
- [Factory Pattern](https://refactoring.guru/design-patterns/factory-method)
- `/ui/dependencies.ts` - Production implementation
- `/core/_tests_/createTestStore.ts` - Test implementation

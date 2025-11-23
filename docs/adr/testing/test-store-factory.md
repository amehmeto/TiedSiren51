# Test Store Factory for Redux Testing

Date: 2025-01-28

## Status

Accepted

## Context

Testing Redux-based business logic requires creating store instances with:

- **Test dependencies**: Fake/stub implementations instead of real services
- **Preloaded state**: Specific initial state for test scenarios
- **Isolated tests**: Each test gets fresh store instance
- **Type safety**: Full TypeScript support
- **Convenience**: Easy to set up in every test

**Without factory pattern**:
```typescript
// Every test must manually set up store
const testDependencies = {
  authGateway: new FakeAuthGateway(),
  repository: new FakeRepository(),
  // ... repeat in every test
}
const store = createStore(testDependencies)
```

**Problems**:
- Repetitive setup code
- Easy to forget dependencies
- Inconsistent test setups
- Hard to change dependencies globally
- Tests coupled to dependency wiring

## Decision

Create a **Test Store Factory** that provides pre-configured Redux stores for testing.

### Implementation

**1. Test Store Factory** (`/core/_tests_/createTestStore.ts`)

```typescript
import { createStore } from '@core/_redux_/createStore'
import type { RootState } from '@core/_redux_/rootReducer'
import type { Dependencies } from '@core/_redux_/dependencies'
import { FakeAuthGateway } from './fakes/fake.auth-gateway'
import { FakeDataBlockSessionRepository } from './fakes/fake.block-session-repository'
import { StubDateProvider } from './stubs/stub.date-provider'
// ... other test doubles

export const createTestStore = (
  preloadedState?: Partial<RootState>,
  dependencyOverrides?: Partial<Dependencies>
) => {
  // Default test dependencies (all fakes/stubs)
  const testDependencies: Dependencies = {
    authGateway: new FakeAuthGateway(),
    blockSessionRepository: new FakeDataBlockSessionRepository(),
    blocklistRepository: new FakeDataBlocklistRepository(),
    sirensRepository: new FakeSirensRepository(),
    remoteDeviceRepository: new FakeRemoteDeviceRepository(),
    notificationService: new FakeNotificationService(),
    databaseService: new StubDatabaseService(),
    dateProvider: new StubDateProvider(),
    backgroundTaskService: new FakeBackgroundTaskService(),

    // Allow test-specific overrides
    ...dependencyOverrides,
  }

  return createStore(testDependencies, preloadedState as RootState)
}
```

**2. Usage in Tests**

```typescript
import { createTestStore } from '@core/_tests_/createTestStore'

describe('BlockSession Use Cases', () => {
  it('starts a block session', async () => {
    // ✅ Simple one-liner
    const store = createTestStore()

    await store.dispatch(startBlockSession({ blocklistId: '1' }))

    const session = selectActiveSession(store.getState())
    expect(session).toBeDefined()
  })

  it('starts session with preloaded data', async () => {
    // ✅ Easy to provide initial state
    const store = createTestStore({
      blocklist: blocklistAdapter.getInitialState({
        entities: { '1': testBlocklist },
        ids: ['1'],
      }),
    })

    await store.dispatch(startBlockSession({ blocklistId: '1' }))

    expect(selectActiveSession(store.getState())).toBeDefined()
  })

  it('uses custom date for testing', async () => {
    const customDateProvider = new StubDateProvider()
    customDateProvider.setNow(new Date('2025-01-01'))

    // ✅ Easy to override specific dependencies
    const store = createTestStore(undefined, {
      dateProvider: customDateProvider,
    })

    await store.dispatch(startBlockSession({ blocklistId: '1' }))

    const session = selectActiveSession(store.getState())
    expect(session?.startTime).toEqual(new Date('2025-01-01'))
  })
})
```

## Consequences

### Positive

- **Convenience**: One function call to get configured store
- **Consistency**: All tests use same default dependencies
- **Isolation**: Each test gets fresh store instance
- **Type safety**: Full TypeScript support with inference
- **Flexibility**: Easy to override state or dependencies per test
- **Maintainability**: Change dependencies in one place
- **Discoverability**: IDE autocomplete for factory
- **Less boilerplate**: No dependency wiring in every test
- **Testability**: All dependencies are test doubles by default
- **No side effects**: Fake dependencies don't write to disk/network

### Negative

- **Indirection**: Must look at factory to see default dependencies
- **Hidden dependencies**: Not obvious what dependencies exist
- **Global defaults**: Changing factory affects all tests
- **Learning curve**: New team members must learn factory pattern

### Neutral

- **Centralized configuration**: All test dependencies in one file
- **Factory pattern**: Standard pattern from OOP

## Alternatives Considered

### 1. Manual Store Creation in Each Test
**Rejected because**:
```typescript
// Repeated in every test
const store = createStore({
  authGateway: new FakeAuthGateway(),
  repository: new FakeRepository(),
  // ... 10+ dependencies
})
```
- Extremely repetitive
- Error-prone
- Hard to maintain
- Tests couple to implementation

### 2. Shared Global Store
**Rejected because**:
```typescript
let store: AppStore

beforeEach(() => {
  store = createStore(/* ... */)
})
```
- Tests not isolated
- State pollution between tests
- Hard to customize per test
- Flaky tests

### 3. Jest beforeEach in Every Test File
**Rejected because**:
```typescript
describe('Feature', () => {
  let store: AppStore

  beforeEach(() => {
    store = createTestStore()
  })
})
```
- Still repetitive across files
- Extra variable in scope
- Harder to customize
- More boilerplate

### 4. Fixture Files
**Rejected because**:
```typescript
import { testStore } from './fixtures'
```
- Not isolated (shared state)
- Hard to customize
- Confusing mental model

## Implementation Notes

### Key Files
- `/core/_tests_/createTestStore.ts` - Factory implementation
- `/core/_tests_/stubs/` - Stub implementations
- `/core/_tests_/fakes/` - Fake implementations

### Factory Signature

```typescript
export const createTestStore = (
  preloadedState?: Partial<RootState>,
  dependencyOverrides?: Partial<Dependencies>
): AppStore
```

**Parameters**:
- `preloadedState`: Initial Redux state (partial, merged with defaults)
- `dependencyOverrides`: Override specific dependencies

**Returns**:
- Fully configured `AppStore` with test doubles

### Usage Patterns

**Basic usage**:
```typescript
const store = createTestStore()
```

**With preloaded state**:
```typescript
const store = createTestStore({
  auth: {
    user: testUser,
    isAuthenticated: true,
  },
})
```

**With custom dependency**:
```typescript
const customRepo = new FakeDataBlockSessionRepository()
const store = createTestStore(undefined, {
  blockSessionRepository: customRepo,
})

// Can spy on custom repo
expect(customRepo.sessions).toHaveLength(0)
```

**Both state and dependencies**:
```typescript
const dateProvider = new StubDateProvider()
dateProvider.setNow(new Date('2025-01-01'))

const store = createTestStore(
  { auth: { user: testUser } },
  { dateProvider }
)
```

### State Builder Integration

Combine with state builder for complex state:

```typescript
import { stateBuilder } from '@core/_tests_/state-builder'

const store = createTestStore(
  stateBuilder()
    .withAuth(testUser)
    .withSirens([twitterSiren, redditSiren])
    .withBlocklists([focusBlocklist])
    .build()
)
```

### Testing Async Actions

```typescript
it('loads user data', async () => {
  const store = createTestStore()

  // Fake auth gateway will be used
  await store.dispatch(loadUser('user-123'))

  const state = store.getState()
  expect(state.auth.user).toBeDefined()
})
```

### Testing with Controlled Time

```typescript
it('expires session after duration', async () => {
  const dateProvider = new StubDateProvider()
  dateProvider.setNow(new Date('2025-01-01T10:00:00Z'))

  const store = createTestStore(undefined, { dateProvider })

  await store.dispatch(startBlockSession({ duration: 60 }))

  // Advance time by 60 minutes
  dateProvider.advanceBy(60 * 60 * 1000)

  await store.dispatch(checkSessionExpiry())

  expect(selectActiveSession(store.getState())).toBeNull()
})
```

### Accessing Dependencies from Store

```typescript
it('calls repository correctly', async () => {
  const mockRepository = new FakeDataBlockSessionRepository()
  const store = createTestStore(undefined, {
    blockSessionRepository: mockRepository,
  })

  await store.dispatch(saveBlockSession(testSession))

  // Verify fake repository was called
  expect(mockRepository.sessions).toHaveLength(1)
})
```

### Related ADRs
- [Stub vs Fake Implementations](stub-vs-fake-implementations.md)
- [Dependency Injection Pattern](../architecture/dependency-injection-pattern.md)
- [Vitest Over Jest](vitest-over-jest.md)
- [Fixture Pattern](fixture-pattern.md)

## References

- [Testing Redux](https://redux.js.org/usage/writing-tests)
- [Test Fixtures](https://en.wikipedia.org/wiki/Test_fixture)
- `/core/_tests_/createTestStore.ts` - Implementation

# Fixture Pattern for Test Data

Date: 2025-01-28

## Status

Accepted

## Context

Tests in TiedSiren51 need to create complex domain objects:

- **Sirens**: With type (app/website/keyword), platform, validation rules
- **Blocklists**: Collections of sirens with metadata
- **Block Sessions**: With timing, state, associated blocklists
- **Users**: With authentication state

Challenges:
- **Boilerplate**: Creating objects with all required fields is verbose
- **Maintenance**: Schema changes break many tests
- **Readability**: Test setup obscures test intent
- **Duplication**: Same object setup repeated across tests
- **Defaults**: Most tests only care about 1-2 fields, rest are noise

Traditional approach:
```typescript
it('blocks twitter during session', () => {
  const siren = {
    id: '1',
    name: 'Twitter',
    type: 'app',
    packageId: 'com.twitter.android',
    bundleId: 'com.twitter.app',
    platform: 'android',
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 'user1',
  }
  // Test logic...
})
```

Problems:
- 9 lines of setup for simple test
- Most fields irrelevant to test
- Schema change breaks this test even if unrelated

## Decision

Use **Fixture Pattern** with given/when/then API for test data creation.

### Implementation

**1. Fixture Builder** (`/core/{domain}/usecases/{domain}.fixture.ts` or `/core/{domain}/{domain}.fixture.ts`)

```typescript
export const sirensFixture = () => {
  const sirens: Siren[] = []

  return {
    given: {
      twitterSiren: () => {
        sirens.push({
          id: 'twitter-1',
          name: 'Twitter',
          type: 'app',
          packageId: 'com.twitter.android',
          // ... sensible defaults
        })
        return api
      },
      sirenWithCustomFields: (overrides: Partial<Siren>) => {
        sirens.push({ ...defaultSiren, ...overrides })
        return api
      },
    },
    when: {
      getSirens: () => sirens,
      getSirenById: (id: string) => sirens.find(s => s.id === id),
    },
    then: {
      shouldHaveSiren: (name: string) => {
        expect(sirens.find(s => s.name === name)).toBeDefined()
      },
    },
  }

  const api = { given, when, then }
  return api
}
```

**2. Usage in Tests**

```typescript
import { sirensFixture } from '@core/siren/usecases/sirens.fixture'

it('blocks twitter during session', () => {
  const fixture = sirensFixture()

  fixture.given.twitterSiren() // 1 line instead of 9!

  const sirens = fixture.when.getSirens()

  fixture.then.shouldHaveSiren('Twitter')
})
```

**3. Custom Overrides**

```typescript
it('handles siren with special configuration', () => {
  const fixture = sirensFixture()

  fixture.given.sirenWithCustomFields({
    name: 'Custom App',
    type: 'app',
    // Only override what matters for this test
  })

  // Test logic...
})
```

**4. Chaining**

```typescript
const fixture = sirensFixture()
  .given.twitterSiren()
  .given.redditSiren()
  .given.youtubeSiren()

const sirens = fixture.when.getSirens()
expect(sirens).toHaveLength(3)
```

## Consequences

### Positive

- **Concise**: One line to create complex objects
- **Readable**: `given.twitterSiren()` is self-documenting
- **Maintainable**: Schema changes only update fixture, not every test
- **Flexible**: Override specific fields when needed
- **Reusable**: Common test objects defined once
- **Discoverable**: IDE autocomplete shows available fixtures
- **BDD-style**: given/when/then familiar from BDD
- **Type-safe**: Full TypeScript support with autocomplete
- **Chainable**: Fluent API for building test data
- **Centralized**: All test data builders in one place

### Negative

- **Indirection**: Must look up fixture to see defaults
- **Learning curve**: Team must learn fixture API
- **Overhead**: Upfront cost to create fixtures
- **Maintenance**: Fixtures need updates when domain changes
- **Abstraction**: Can hide important test details
- **Debugging**: Harder to see exact object in debugger

### Neutral

- **Convention**: Requires team discipline to use fixtures
- **File organization**: Separate directory for fixtures

## Alternatives Considered

### 1. Object Literals in Tests
**Rejected because**:
- Verbose and repetitive
- Schema changes break many tests
- Obscures test intent
- Hard to maintain

### 2. Factory Functions (Simple)
**Rejected because**:
- Less discoverable (no chaining)
- No given/when/then structure
- Less expressive

### 3. Test Data Builders (Class-based)
**Rejected because**:
- More boilerplate (classes vs functions)
- Less idiomatic JavaScript
- Heavier weight

### 4. Faker.js
**Rejected because**:
- Random data makes tests non-deterministic
- Bundle size
- Doesn't fit domain concepts well

### 5. Snapshot Testing Only
**Rejected because**:
- Brittle (breaks on any change)
- Doesn't test behavior
- Hard to understand failures

## Implementation Notes

### Key Files

Fixtures are **colocated with their domains**, not centralized:

- `/core/auth/authentification.fixture.ts` - Auth fixture
- `/core/siren/usecases/sirens.fixture.ts` - Siren fixtures
- `/core/blocklist/usecases/blocklist.fixture.ts` - Blocklist fixture
- `/core/block-session/usecases/block-session.fixture.ts` - BlockSession fixture
- `/core/strict-mode/usecases/timer.fixture.ts` - StrictMode timer fixture
- `/core/_tests_/state-builder.ts` - Redux state builder
- `/core/_tests_/data-builders/` - Data builders (separate from fixtures)

### Fixture Structure

```typescript
export const {domain}Fixture = () => {
  const items: Item[] = []

  const given = {
    // Preset objects (e.g., twitterSiren)
    commonObject: () => { ... },
    // Custom object with overrides
    objectWithFields: (overrides: Partial<Item>) => { ... },
  }

  const when = {
    // Queries
    getItems: () => items,
    getItemById: (id: string) => items.find(...),
  }

  const then = {
    // Assertions
    shouldHaveItem: (name: string) => expect(...),
  }

  const api = { given, when, then }
  return api
}
```

### State Builder Pattern

For complex Redux state:

```typescript
// /core/_tests_/state-builder.ts
export const stateBuilder = () => {
  let state: RootState = initialState

  return {
    withSirens: (sirens: Siren[]) => {
      state.siren = sirenAdapter.setAll(state.siren, sirens)
      return api
    },
    withAuth: (user: AuthUser) => {
      state.auth.user = user
      return api
    },
    build: () => state,
  }

  const api = { withSirens, withAuth, build }
  return api
}

// Usage:
const state = stateBuilder()
  .withSirens([twitterSiren, redditSiren])
  .withAuth(testUser)
  .build()

const store = createTestStore(state)
```

### Naming Conventions
- Fixture files: `{domain}.fixture.ts`
- Location: Colocated with domain (`/core/{domain}/` or `/core/{domain}/usecases/`)
- Builder files: `{domain}.builder.ts` (in `/core/_tests_/data-builders/`)

**Note**: Fixtures are colocated with their domains because they contain domain-specific test setup logic. Data builders are centralized because they're simple object factories reused across all tests.

### Best Practices

1. **Sensible defaults**: Fixtures should work without overrides
2. **Named presets**: `twitterSiren()` better than `siren1()`
3. **Minimal overrides**: Only override what's relevant to test
4. **Immutability**: Fixtures shouldn't modify shared state
5. **Type safety**: Use `Partial<T>` for overrides
6. **Hide implementation details**: Don't expose infrastructure like store creation
7. **Don't abstract one-liners**: Inline simple operations instead of creating helper functions

### Hide Implementation Details

Fixtures should only expose **meaningful business actions**, not infrastructure setup. Store creation, listener initialization, and other infrastructure are implementation details that should be hidden inside `when` methods.

#### `then` Methods Must Encapsulate Assertions

`then` methods should contain assertions, not return values for external assertion. Returning implementation details (like call counts) leaks internals and defeats the purpose of the fixture pattern.

**Bad - Leaking implementation details**:
```typescript
// DON'T: Return values from then methods
const callCount = fixture.then.updateBlockingScheduleCallCount()
expect(callCount).toBe(0) // Assertion outside fixture

// The test now knows about "call counts" - an implementation detail
// What if we change how we track syncs? Every test breaks.
```

**Good - Encapsulated assertions**:
```typescript
// DO: then methods contain the assertion
fixture.then.blockingScheduleShouldNotHaveBeenSynced()

// Or if you need to assert a specific count:
fixture.then.blockingScheduleShouldHaveBeenSyncedTimes(0)

// Implementation in fixture:
then: {
  blockingScheduleShouldNotHaveBeenSynced() {
    expect(sirenTier.updateCallCount).toBe(0)
  },
  blockingScheduleShouldHaveBeenSyncedTimes(expected: number) {
    expect(sirenTier.updateCallCount).toBe(expected)
  },
}
```

**Why this matters**:
- Tests express **what** should happen, not **how** to verify it
- Implementation changes (e.g., tracking mechanism) only update the fixture
- Tests remain readable business specifications

**Bad - Exposing infrastructure**:
```typescript
// DON'T: Exposes store creation as a "given"
fixture.given.storeIsCreated()
await fixture.when.blockSessionsChange([...])

// DON'T: Creates unnecessary helper function
const getStore = () => {
  if (!store) store = createTestStore(...)
  return store
}
```

**Good - Infrastructure is implicit**:
```typescript
// DO: Store creation happens inside the when method
async blockSessionsChange(sessions: BlockSession[]) {
  store = createTestStore(dependencies, stateBuilder.getState())
  store.dispatch(setBlockSessions(sessions))
  await flushPromises()
}

// Test reads naturally - no infrastructure noise
fixture.given.initialBlockSessions([...])
await fixture.when.blockSessionsChange([])
fixture.then.blockingScheduleShouldBeEmpty()
```

**Why inline `store = createTestStore(...)` instead of a helper?**

The direct assignment is:
- **One line** - no value in wrapping it
- **Self-explanatory** - clearly creates a fresh store
- **Local to where it's used** - easy to understand in context

Each test gets a fresh store - don't use `??=` which would reuse a stale store.

Don't abstract one-liners. Simple repetition of a clear pattern is better than premature abstraction.

**Testing initialization behavior**:

To test behavior that happens on initialization (e.g., listener syncs on startup), use a real `when` action and verify the combined result:

```typescript
// DON'T: Expose initialization as a separate action
await fixture.when.listenerInitializes()
fixture.then.blockingScheduleShouldContainApps([...])

// DO: Trigger any action and verify initialization happened
fixture.given.existingBlockSessions([activeSession])
await fixture.when.unrelatedStateChanges()
fixture.then.blockingScheduleShouldContainApps([...]) // Synced during init
```

### DSL Conventions

The fixture pattern follows a strict given/when/then DSL that separates concerns:

#### 1. `given` - Set Up Preconditions

`given` functions configure the initial state before testing. They should:
- Set up data in repositories/stores
- Configure authentication state
- Prepare any external dependencies

```typescript
const fixture = timerFixture()

// Setting up preconditions
fixture.given.existingTimer('2024-01-01T01:00:00.000Z')
fixture.given.authenticatedUser({ id: 'user-1', email: 'test@example.com' })
fixture.given.noTimer()  // Explicit empty state
```

#### 2. `when` - Trigger Actions

`when` functions execute the action being tested. They should:
- Call the use case or action under test
- Return any result that needs to be verified

```typescript
// Triggering the action
const action = await fixture.when.startingTimer({ minutes: 30 })
await fixture.when.extendingTimerOf({ hours: 1 })
await fixture.when.loadingTimer()
```

#### 3. `then` - Verify Outcomes

`then` functions assert the expected outcomes. They should:
- Check the store state
- Verify persistence
- Validate error conditions

```typescript
// Verifying outcomes
fixture.then.timerShouldBeStoredAs('2024-01-01T01:30:00.000Z')
await fixture.then.timerShouldBePersisted('2024-01-01T01:30:00.000Z')
fixture.then.actionShouldBeRejectedWith(action, 'No active timer')
```

### Domain Language

Fixture methods should express **business behavior**, not technical operations. Tests should read like specifications that describe what the user does, not how the code works.

**Tests should read like specifications**:
```typescript
// The test reads as a business requirement:
// "Given existing block sessions with a blocklist,
//  when the user updates the blocklist,
//  then the blocking schedule reflects the change"

fixture.given.existingBlockSessions([sessionWithBlocklist])
await fixture.when.updatingBlocklist(modifiedBlocklist)
fixture.then.blockingScheduleShouldContainApps(['com.facebook.katana'])
```

**Name methods after use case actions, not code operations**:

The `when` methods should reflect domain use cases, not technical operations. Use cases are decoupled from the UI - they express what business action is being performed:

```typescript
// Good: Named after use case / business actions
fixture.when.creatingBlockSession(session)   // Use case: create a session
fixture.when.updatingBlocklist(blocklist)    // Use case: update a blocklist
fixture.when.startingTimer({ minutes: 30 })  // Use case: start a timer

// Bad: Named after code operations
fixture.when.dispatchingSetBlockSessions(sessions)  // Technical operation
fixture.when.blockSessionsChange(sessions)          // Generic, unclear intent
fixture.when.storeIsCreated()                       // Implementation detail
```

**Good (Domain Language)**:
```typescript
fixture.given.existingBlockSessions([session])  // Sessions exist
fixture.given.existingBlocklists([blocklist])   // Blocklists exist
fixture.when.updatingBlocklist(blocklist)       // User edits blocklist
fixture.then.blockingScheduleShouldContainApps([...])
```

**Avoid (Technical Terms)**:
```typescript
fixture.given.initialBlockSessions([session])   // "initial" is technical
fixture.given.setRepositoryData(data)           // Technical operation
fixture.when.blocklistIsUpdated(blocklist)      // Passive voice, unclear actor
fixture.when.unrelatedStateChanges()            // Not a use case, implementation detail
fixture.then.stateShouldEqual(expectedState)    // Implementation detail
```

### Only Test Through Real Use Case Actions

Every `when` method should represent a real use case action. Avoid creating methods that exist only to trigger side effects or test implementation details.

**Bad - Testing implementation behavior**:
```typescript
// DON'T: "unrelatedStateChanges" is not a use case
it('should NOT sync when unrelated state changes', async () => {
  fixture.given.existingBlockSessions([session])
  await fixture.when.unrelatedStateChanges()  // What use case is this?
  expect(callCount).toBe(1)
})

// DON'T: Testing that nothing happens is often an implementation detail
it('should NOT sync on initialization when no active sessions', async () => {
  await fixture.when.unrelatedStateChanges()
  expect(callCount).toBe(0)  // Testing absence of behavior
})
```

**Good - Testing through real use cases**:
```typescript
// DO: Test initialization implicitly through a real use case
it('should restore blocking when updating blocklist after app restart', async () => {
  fixture.given.existingBlockSessions([sessionWithBlocklist])

  await fixture.when.updatingBlocklist(blocklistWithNewSiren)

  // Verifies both: initialization synced existing apps AND update added new one
  fixture.then.blockingScheduleShouldContainApps([
    'com.facebook.katana',  // From initialization
    'com.example.tiktok',   // From update
  ])
})
```

If you can't express a test through a real use case action, ask yourself:
- Is this testing business behavior or implementation optimization?
- Would a user care about this scenario?
- Can this be verified as a side effect of a real action?

### Consolidating Tests with it.each

When multiple test cases share the same structure but differ in inputs/outputs, use `it.each` with `given` functions to avoid conditionals in tests.

**Problem**: The `vitest/no-conditional-in-test` ESLint rule forbids if/else in tests.

**Solution**: Use `given` functions in test data:

```typescript
it.each<{
  scenario: string
  given: () => void
  payload: ExtendTimerPayload
  expectedError: string
}>([
  {
    scenario: 'no active timer exists',
    given: () => fixture.given.noTimer(),
    payload: { minutes: 30 },
    expectedError: 'No active timer to extend',
  },
  {
    scenario: 'timer has expired',
    given: () => fixture.given.existingTimer('2023-12-31T23:59:59.000Z'),
    payload: { minutes: 30 },
    expectedError: 'No active timer to extend',
  },
  {
    scenario: 'extended duration exceeds maximum',
    given: () => fixture.given.existingTimer('2024-01-30T23:00:00.000Z'),
    payload: { hours: 2 },
    expectedError: 'Extended timer duration exceeds maximum allowed (30 days)',
  },
])(
  'should reject when $scenario',
  async ({ given, payload, expectedError }) => {
    given()  // Execute the given function
    const action = await fixture.when.extendingTimerOf(payload)
    fixture.then.actionShouldBeRejectedWith(action, expectedError)
  },
)
```

This pattern:
- Eliminates conditionals in tests
- Makes test data declarative
- Keeps tests DRY while readable
- Satisfies `vitest/no-conditional-in-test` rule

### Example Test

```typescript
import { sirensFixture } from '@core/siren/usecases/sirens.fixture'
import { blocklistFixture } from '@core/blocklist/usecases/blocklist.fixture'

describe('Blocklist Management', () => {
  it('adds siren to blocklist', () => {
    const sirenFx = sirensFixture()
    const blocklistFx = blocklistFixture()

    sirenFx.given.twitterSiren()
    blocklistFx.given.focusModeBlocklist()

    const siren = sirenFx.when.getSirenById('twitter-1')
    const blocklist = blocklistFx.when.getBlocklistById('focus-1')

    // Test logic with clean, readable setup
    expect(blocklist.sirenIds).not.toContain(siren.id)

    addSirenToBlocklist(blocklist.id, siren.id)

    blocklistFx.then.shouldContainSiren(siren.id)
  })
})
```

### Related ADRs
- [Vitest Over Jest](vitest-over-jest.md)
- [Test Store Factory](test-store-factory.md)
- [Stub vs Fake Implementations](stub-vs-fake-implementations.md)

## References

- [Test Data Builders](http://www.natpryce.com/articles/000714.html)
- [Fixture Pattern](https://en.wikipedia.org/wiki/Test_fixture)
- Fixtures: `/core/{domain}/usecases/{domain}.fixture.ts`
- Data builders: `/core/_tests_/data-builders/`

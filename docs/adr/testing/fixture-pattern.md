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

**1. Fixture Builder** (`/core/_tests_/data-builders/sirens.fixture.ts`)

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
import { sirensFixture } from '@core/_tests_/data-builders'

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
- `/core/_tests_/data-builders/sirens.fixture.ts` - Siren fixtures
- `/core/_tests_/data-builders/` - All domain fixtures
- `/core/_tests_/state-builder.ts` - Redux state builder

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
- Builder files: `{domain}.builder.ts`
- Location: `/core/_tests_/data-builders/`

### Best Practices

1. **Sensible defaults**: Fixtures should work without overrides
2. **Named presets**: `twitterSiren()` better than `siren1()`
3. **Minimal overrides**: Only override what's relevant to test
4. **Immutability**: Fixtures shouldn't modify shared state
5. **Type safety**: Use `Partial<T>` for overrides

### Example Test

```typescript
import { sirensFixture, blocklistFixture } from '@core/_tests_/data-builders'

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
- `/core/_tests_/data-builders/` - Implementation

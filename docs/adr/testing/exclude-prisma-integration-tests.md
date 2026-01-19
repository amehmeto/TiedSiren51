# Exclude Prisma Integration Tests

Date: 2025-01-28

## Status

Accepted (Temporary)

## Context

Prisma repository integration tests verify database operations work correctly:

- CRUD operations (create, read, update, delete)
- Query filtering and ordering
- Relationship handling
- Transaction support

**Problem**: Prisma integration tests fail in Vitest due to polyfill conflicts:

```
Error: @prisma/react-native requires react-native-url-polyfill
but it conflicts with Vitest's URL polyfill in Node environment
```

**Root cause**:
- `@prisma/react-native` requires `react-native-url-polyfill`
- Vitest runs in Node.js environment
- Node.js has native URL implementation
- Polyfills clash with native implementation
- Tests fail during Prisma client initialization

**Attempted solutions**:
- Various polyfill configurations
- Different test environments
- Mocking Prisma client
- None worked reliably

**Current state**:
- Unit tests for business logic: ✅ Working (98.83% coverage)
- Repository integration tests: ❌ Excluded
- E2E tests: ✅ Working (test real Prisma)
- Production Prisma usage: ✅ Working fine

## Decision

**Temporarily exclude** Prisma integration tests with pattern: `infra/**/prisma.*.test.ts`

### Implementation

**1. Vitest Configuration** (`/vitest.config.js`)

```javascript
export default {
  test: {
    exclude: [
      'node_modules/',
      'infra/**/prisma.*.test.ts',  // Excluded due to polyfill conflicts
    ],
  },
}
```

**2. Documentation** (`/docs/TECH_DEBT.md`)

```markdown
### 5. Testing Coverage
**Priority: Medium** | **Effort: High**

- Resolve excluded Prisma tests (pattern: 'infra/**/prisma.*.test.ts')
- Tests temporarily disabled due to incompatibility between
  @prisma/react-native and react-native-url-polyfill with test setup
```

**3. Alternative Testing Strategy**

```typescript
// Instead of testing Prisma directly, test through fake repositories
describe('BlockSession Use Cases', () => {
  it('saves block session', async () => {
    const store = createTestStore()  // Uses FakeRepository

    await store.dispatch(saveBlockSession(session))

    expect(selectAllBlockSessions(store.getState())).toHaveLength(1)
  })
})

// E2E tests verify real Prisma integration
```

## Consequences

### Positive

- **Unit tests pass**: No test failures blocking CI
- **High coverage maintained**: 98.83% overall coverage
- **Business logic tested**: Core use cases thoroughly tested
- **Alternative verification**: E2E tests verify Prisma works
- **Fake repositories**: Thoroughly tested via business logic tests
- **Clear documentation**: Issue tracked in TECH_DEBT.md
- **Temporary measure**: Plan to fix when polyfill issue resolved

### Negative

- **No direct Prisma tests**: Repository implementations not directly tested
- **Gap in coverage**: Infrastructure layer has lower coverage
- **Manual verification**: Must manually test Prisma repositories
- **Regression risk**: Prisma bugs might not be caught by tests
- **Technical debt**: Issue needs eventual resolution
- **False confidence**: High coverage number doesn't include repositories

### Neutral

- **Pragmatic trade-off**: Ship working tests vs perfect coverage
- **Future improvement**: Will revisit when ecosystem matures

## Alternatives Considered

### 1. Fix Polyfill Conflicts
**Attempted but failed**:
- Tried multiple polyfill configurations
- Attempted different Vitest environments
- Explored custom test setups
- None worked reliably
- Too time-consuming for MVP

### 2. Mock Prisma Client
**Rejected because**:
- Would test mocks, not real Prisma
- Defeats purpose of integration tests
- Doesn't verify database operations
- Complex to set up correctly

### 3. Separate Test Environment
**Rejected because**:
- Would require separate test runner
- More CI complexity
- Still need to solve polyfill issue
- Maintenance overhead

### 4. Skip Unit Tests, Only E2E
**Rejected because**:
- E2E tests too slow for TDD
- Can't test edge cases easily
- Harder to debug
- Less granular feedback

### 5. Accept Failing Tests
**Rejected because**:
- Breaks CI
- Reduces confidence in test suite
- Masks real failures
- Bad developer experience

## Implementation Notes

### Key Files
- `/vitest.config.js:exclude` - Exclusion pattern
- `/docs/TECH_DEBT.md#5` - Technical debt tracking
- `/infra/**/prisma.*.test.ts` - Excluded test files (still exist)

### Excluded Test Files

```
/infra/block-session-repository/prisma.block-session.repository.test.ts
/infra/blocklist-repository/prisma.blocklist.repository.test.ts
/infra/siren-repository/prisma.sirens-repository.test.ts
/infra/device-repository/prisma.remote-device.repository.test.ts
```

### Test Coverage Impact

**Without Prisma tests**:
- Overall: 98.83%
- Core business logic: 99%+
- Infrastructure layer: ~85% (repositories excluded)

**If Prisma tests were included**:
- Would add ~200 lines of tested code
- Might increase overall to ~99%

### Alternative Verification

**1. Fake Repository Tests** (Extensive):
```typescript
// Fake repositories thoroughly tested via use cases
describe('BlockSession Use Cases', () => {
  // 50+ tests using FakeDataBlockSessionRepository
})
```

**2. E2E Tests** (Real Prisma):
```yaml
# /maestro/flows/create-blocklist.yaml
# Tests real Prisma operations end-to-end
```

**3. Manual Testing**:
- Development testing on real devices
- QA testing before releases
- Production monitoring

### When to Revisit

**Triggers to fix**:
1. `@prisma/react-native` fixes polyfill compatibility
2. Vitest adds better React Native support
3. Alternative polyfill solution found
4. Team has bandwidth for deep investigation

**Steps to fix**:
1. Remove exclusion from `vitest.config.js`
2. Run tests: `yarn test`
3. If passing, update TECH_DEBT.md
4. Celebrate increased coverage

### Temporary Workarounds

**For Prisma verification**:
```typescript
// Can write smoke tests that run separately
// Not in main test suite, run manually

import { PrismaClient } from '@prisma/client'

// Only run manually: node infra/smoke-test.js
async function smokeTest() {
  const prisma = new PrismaClient()

  const siren = await prisma.siren.create({
    data: { name: 'Test', type: 'app' },
  })

  console.log('✅ Prisma works:', siren)
}

smokeTest()
```

### Related ADRs
- [Vitest Over Jest](vitest-over-jest.md)
- [Prisma ORM with SQLite](../infrastructure/prisma-orm-sqlite.md)
- [Test Store Factory](test-store-factory.md)

## References

- [Prisma React Native Issue](https://github.com/prisma/prisma/issues/react-native-polyfill)
- [Vitest Environment Config](https://vitest.dev/config/#environment)
- `/docs/TECH_DEBT.md#5` - Tracking issue
- `/vitest.config.js` - Configuration

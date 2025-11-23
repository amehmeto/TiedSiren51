# Testing Coverage Enhancement

**Priority**: ⚠️ **MEDIUM**
**Effort**: High
**Status**: Open - Partially Complete
**Created**: January 28, 2025
**Current Coverage**: 42.1%

## Problem Statement

While unit tests cover core business logic well, several testing gaps exist:

1. **Missing Integration Tests**: No tests for full workflows across layers
2. **Prisma Tests Disabled**: `infra/**/prisma.*.test.ts` excluded from test runs
3. **Edge Cases**: JSON fields, concurrent operations not fully tested
4. **Repository Tests**: Infrastructure tests are minimal

## Current Status

**What's Working**:
- ✅ Core business logic unit tests (high coverage)
- ✅ Use case tests with mocked dependencies
- ✅ Selector tests
- ✅ Redux slice tests

**What's Missing**:
- ❌ Integration tests across layers
- ❌ Prisma repository tests (temporarily disabled)
- ❌ Concurrent operation tests
- ❌ Edge case coverage for JSON fields
- ❌ E2E tests for critical flows

## Specific Issues

### 1. Prisma Integration Tests Disabled

**Issue**: Pattern `'infra/**/prisma.*.test.ts'` excluded from test suite

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    exclude: [
      // ...
      'infra/**/prisma.*.test.ts',  // ⚠️ Tests disabled
    ],
  },
})
```

**Root Cause**: Incompatibility between:
- `@prisma/react-native` module
- `react-native-url-polyfill`
- Current test environment setup

**Impact**: No tests for database operations in production code paths

**Fix Needed**:
1. Investigate polyfill conflicts
2. Set up proper test environment for Prisma
3. Re-enable tests or rewrite with different approach
4. Consider using SQLite in-memory for tests

### 2. Missing Integration Tests

**Examples of untested flows**:
- Creating block session → Scheduling notifications → Starting session
- User signup → Authentication → First-time setup
- Adding siren → Creating blocklist → Starting blocking

**Why Important**: Unit tests don't catch:
- Layer integration bugs
- Adapter implementation issues
- Data flow problems across boundaries

**Proposed Solution**:

```typescript
// tests/integration/create-block-session.integration.test.ts
describe('Create Block Session Integration', () => {
  it('creates session, schedules notifications, and persists to DB', async () => {
    // Use real implementations (not mocks) where possible
    const realNotificationService = new ExpoNotificationService()
    const realRepository = new PrismaBlockSessionRepository()
    const store = createTestStore({ notificationService, repository })

    // Execute use case
    await store.dispatch(createBlockSession({
      name: 'Work Time',
      startTime: '09:00',
      endTime: '17:00',
    }))

    // Verify end-to-end behavior
    const sessions = await realRepository.getAll()
    expect(sessions).toHaveLength(1)

    const notifications = await realNotificationService.getScheduled()
    expect(notifications).toHaveLength(2) // start + end
  })
})
```

### 3. JSON Field Edge Cases

**Current Risk**: Blocklists use JSON fields for sirens

```typescript
sirens: {
  android: [...],
  ios: [...],
  // ...
}
```

**Untested scenarios**:
- Very large arrays (1000+ items)
- Special characters in app names/URLs
- Malformed JSON data recovery
- Migration between JSON structures

### 4. Concurrent Operations

**Untested**: What happens when:
- Two sessions modify same blocklist simultaneously
- User creates session while another is starting
- Background task runs during user action

## Proposed Improvements

### Phase 1: Fix Prisma Tests (High Priority)

**Goal**: Re-enable `infra/**/prisma.*.test.ts` tests

**Steps**:
1. Research `@prisma/react-native` test setup
2. Configure proper test environment
3. Use in-memory SQLite for tests
4. Re-enable test files
5. Fix any failing tests

**Estimated Effort**: 4-6 hours

### Phase 2: Add Integration Tests (Medium Priority)

**Goal**: Test critical flows end-to-end

**Key Flows to Test**:
1. User signup → Auth → Setup
2. Create session → Schedule → Execute
3. Add siren → Blocklist → Block

**Estimated Effort**: 8-12 hours (2-3 flows)

### Phase 3: Edge Case Testing (Low Priority)

**Goal**: Test boundary conditions and edge cases

**Areas**:
- Large datasets (stress testing)
- Concurrent operations
- Error recovery
- Data migration scenarios

**Estimated Effort**: 6-8 hours

### Phase 4: E2E Tests Expansion (Low Priority)

**Current**: Maestro tests exist but limited

**Goal**: Expand E2E coverage

**Estimated Effort**: 4-6 hours

## Success Metrics

Target coverage improvements:
- **Current**: 42.1%
- **Phase 1**: 50%+ (Prisma tests enabled)
- **Phase 2**: 60%+ (Integration tests added)
- **Phase 3**: 70%+ (Edge cases covered)
- **Long-term**: 80%+ (Comprehensive coverage)

## Trigger Points

Address when:
- **Phase 1 (Prisma)**: Before next database-related feature
- **Phase 2 (Integration)**: When reaching 1000 active users
- **Phase 3 (Edge cases)**: After observing production bugs
- **Phase 4 (E2E)**: Before major release

## Current Workaround

Since Prisma tests are disabled, we:
- ✅ Test repository interfaces with fake implementations
- ✅ Use integration tests in development environment manually
- ⚠️ Rely on E2E tests to catch database issues

**This is acceptable short-term but not sustainable long-term.**

## Implementation Priority

1. **Immediate**: Fix Prisma test environment (Phase 1)
2. **Short-term**: Add 2-3 critical integration tests (Phase 2)
3. **Long-term**: Expand edge case and E2E coverage (Phases 3-4)

## Related ADRs

- [Vitest Over Jest](../adr/testing/vitest-over-jest.md)
- [Fixture Pattern](../adr/testing/fixture-pattern.md)
- [Data Builder Pattern](../adr/testing/data-builder-pattern.md)
- [Stub vs Fake Implementations](../adr/testing/stub-vs-fake-implementations.md)
- [Exclude Prisma Integration Tests](../adr/testing/exclude-prisma-integration-tests.md)

## References

- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing/unit-testing)
- [Integration Testing Best Practices](https://martinfowler.com/bliki/IntegrationTest.html)
- Issue: `@prisma/react-native` + `react-native-url-polyfill` incompatibility

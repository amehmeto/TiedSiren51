# Test Data Conventions

Date: 2025-12-07

## Status

Accepted

## Context

Tests in TiedSiren51 need consistent conventions for handling test data:

- **Date/time values**: Calculations vs hardcoded ISO strings
- **Payload types**: Required vs optional properties
- **Test helpers**: Where to invoke helper functions
- **Parameterized tests**: How to structure test.each/it.each data

Inconsistent practices lead to:
- Tests that are hard to understand
- Brittle tests that break when calculations change
- Verbose test data arrays
- Duplicated helper calls in test data

## Decision

### 1. Use Hardcoded Values Over Calculations

Prefer hardcoded ISO strings and values over calculated ones in tests.

**Good**:
```typescript
it('should extend an active timer', async () => {
  fixture.given.existingTimer('2024-01-01T01:00:00.000Z')
  await fixture.when.extendingTimerOf({ minutes: 30 })
  fixture.then.timerShouldBeStoredAs('2024-01-01T01:30:00.000Z')
})
```

**Avoid**:
```typescript
it('should extend an active timer', async () => {
  const givenEndAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()
  const expectedEndAt = new Date(Date.now() + 90 * 60 * 1000).toISOString()

  fixture.given.existingTimer(givenEndAt)
  await fixture.when.extendingTimerOf({ minutes: 30 })
  fixture.then.timerShouldBeStoredAs(expectedEndAt)
})
```

**Why**:
- Hardcoded values are immediately readable
- No mental math required to understand the test
- Tests remain stable regardless of when they run
- Easier to debug when tests fail

### 2. Extract Input Data, Call Helpers in Test Body

When using parameterized tests (test.each/it.each), keep raw input data in the test case array and call helper functions in the test body.

**Good**:
```typescript
function createFixedTestDate({
  hours = 0,
  minutes = 0,
}: {
  hours?: number
  minutes?: number
}): Date {
  const date = new Date('2024-01-01T00:00:00')
  date.setHours(hours, minutes, 0, 0)
  return date
}

test.each([
  ['afternoon', {}, { hours: 13, minutes: 48 }],
  ['morning', {}, { hours: 8, minutes: 0 }],
  ['evening', {}, { hours: 21, minutes: 30 }],
])(
  'Example: %s',
  (_, preloadedState, nowTime) => {
    const store = createTestStore({}, preloadedState)
    const now = createFixedTestDate(nowTime)  // Helper called in test body

    const viewModel = selectHomeViewModel(store.getState(), now, dateProvider)
    expect(viewModel).toBeDefined()
  },
)
```

**Avoid**:
```typescript
test.each([
  ['afternoon', {}, createFixedTestDate({ hours: 13, minutes: 48 })],  // Helper in array
  ['morning', {}, createFixedTestDate({ hours: 8, minutes: 0 })],
  ['evening', {}, createFixedTestDate({ hours: 21, minutes: 30 })],
])(...)
```

**Why**:
- Test data arrays are cleaner and more readable
- Easier to scan and compare test cases
- Helper functions are called once per test, not during array creation
- Makes it clear what the raw input values are

### 3. Optional Payload Properties with Defaults

Use optional properties in payload types to reduce verbosity in tests.

**Good**:
```typescript
export type StartTimerPayload = {
  days?: number
  hours?: number
  minutes?: number
}

// Usage - only specify what matters
await fixture.when.startingTimer({ minutes: 30 })
await fixture.when.startingTimer({ hours: 2 })
await fixture.when.startingTimer({ days: 1, hours: 12 })
```

**Avoid**:
```typescript
export type StartTimerPayload = {
  days: number
  hours: number
  minutes: number
}

// Forced to specify all fields
await fixture.when.startingTimer({ days: 0, hours: 0, minutes: 30 })
```

**Implementation**:
```typescript
export const startTimer = createAppAsyncThunk<ISODateString, StartTimerPayload>(
  'timer/startTimer',
  async (payload, { extra: { timerRepository, dateProvider }, getState }) => {
    // calculateMilliseconds handles undefined values with defaults
    const durationMs = calculateMilliseconds(payload)
    // ...
  },
)
```

### 4. Helper Functions Accept Object Parameters

Use named parameters (object destructuring) for helper functions to improve readability.

**Good**:
```typescript
function createFixedTestDate({
  hours = 0,
  minutes = 0,
}: {
  hours?: number
  minutes?: number
}): Date {
  const date = new Date('2024-01-01T00:00:00')
  date.setHours(hours, minutes, 0, 0)
  return date
}

// Clear what each value means
const now = createFixedTestDate({ hours: 13, minutes: 48 })
```

**Avoid**:
```typescript
function createFixedTestDate(hours: number, minutes: number): Date {
  const date = new Date('2024-01-01T00:00:00')
  date.setHours(hours, minutes, 0, 0)
  return date
}

// Unclear what 13 and 48 represent
const now = createFixedTestDate(13, 48)
```

## Consequences

### Positive

- **Readable**: Tests are immediately understandable
- **Maintainable**: Changes to helpers don't require updating test data
- **Flexible**: Optional properties reduce boilerplate
- **Consistent**: Team follows same conventions
- **Self-documenting**: Named parameters explain themselves

### Negative

- **Manual calculation**: Must calculate expected values manually
- **Longer ISO strings**: Hardcoded strings take more space
- **Learning curve**: Team must learn conventions

### Neutral

- **Trade-off**: Explicitness vs DRYness (we prefer explicit)

## Alternatives Considered

### 1. Calculated Values Everywhere
**Rejected because**:
- Hard to read and understand
- Requires mental math
- Can mask bugs in calculation logic

### 2. Required Payload Properties
**Rejected because**:
- Verbose tests with unnecessary zeros
- Distracts from what's being tested
- More typing for simple cases

### 3. Positional Helper Parameters
**Rejected because**:
- Unclear what values represent
- Easy to swap arguments by mistake
- Less self-documenting

## Implementation Notes

### Key Files
- `/core/strict-mode/usecases/*.spec.ts` - Timer use case tests
- `/ui/screens/Home/HomeScreen/home.view-model.test.ts` - View model tests
- `/core/__utils__/time.utils.ts` - Utility for handling optional time values

### ESLint Enforcement

The `vitest/no-conditional-in-test` rule enforces some of these conventions by preventing conditionals in tests, which encourages:
- Using `given` functions in test data
- Keeping test logic declarative

### Related ADRs
- [Fixture Pattern](fixture-pattern.md) - given/when/then DSL
- [Data Builder Pattern](data-builder-pattern.md) - Building test objects
- [Vitest Over Jest](vitest-over-jest.md) - Test framework choice

## References

- [Test Data Builders](http://www.natpryce.com/articles/000714.html)
- [Arrange-Act-Assert Pattern](https://wiki.c2.com/?ArrangeActAssert)
- `/core/strict-mode/usecases/extend-timer.usecase.spec.ts` - Example implementation

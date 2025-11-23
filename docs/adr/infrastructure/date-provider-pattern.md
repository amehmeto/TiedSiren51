# Date Provider Pattern

Date: 2025-11-23

## Status

Accepted

## Context

TiedSiren51 extensively uses dates and times for:

- **Block session scheduling**: Determining when sessions start/end
- **Time-based triggers**: Activating blocking at specific times
- **Notifications**: Scheduling notifications for future times
- **Logging**: Recording when events occurred
- **Time comparisons**: Checking if current time is within blocking period

Problems with direct `new Date()` usage:

- **Untestable**: Tests using real time are non-deterministic
- **Flaky tests**: Tests may pass/fail based on when they run
- **Hard to test edge cases**: Midnight rollovers, timezone changes
- **Tightly coupled**: Business logic coupled to system clock
- **Difficult debugging**: Can't easily simulate specific times

Example of untestable code:

```typescript
// ❌ Untestable - uses real time
function isSessionActive(session: BlockSession): boolean {
  const now = new Date()  // Direct dependency on system clock
  return now >= session.startTime && now <= session.endTime
}

// Test fails if run outside session time window
it('session is active', () => {
  expect(isSessionActive(session)).toBe(true)  // Flaky!
})
```

## Decision

Use the **Date Provider Pattern** - abstract date/time operations behind a port interface, with real and stub implementations.

### Implementation

**1. Port Definition** (`core/_ports_/port.date-provider.ts`):

```typescript
export interface DateProvider {
  getNow(): Date
  getISOStringNow(): string
  getMinutesFromNow(minutes: number): Date
  getHHmmMinutesFromNow(minutes: number): string
  recoverDate(timeInHHmm: string): Date
  recoverYesterdayDate(timeInHHmm: string): Date
  toHHmm(date: Date): string
}
```

**2. Real Implementation** (`infra/date-provider/real.date-provider.ts`):

```typescript
export class RealDateProvider implements DateProvider {
  private MILLISECONDS_IN_A_DAY = 24 * 60 * 60 * 1000

  getNow(): Date {
    return new Date()
  }

  getISOStringNow(): string {
    return new Date().toISOString()
  }

  getMinutesFromNow(minutes: number): Date {
    return new Date(new Date().getTime() + minutes * 60 * 1000)
  }

  getHHmmMinutesFromNow(minutes: number): string {
    return this.toHHmm(this.getMinutesFromNow(minutes))
  }

  recoverDate(timeInHHmm: string): Date {
    const [hours, minutes] = timeInHHmm.split(':').map(Number)
    const todayWithNewTime = new Date()
    todayWithNewTime.setHours(hours, minutes, 0, 0)
    return todayWithNewTime
  }

  recoverYesterdayDate(timeInHHmm: string): Date {
    const [hours, minutes] = timeInHHmm.split(':').map(Number)
    const today = new Date().getTime()
    const yesterdayWithNewTime = new Date(today - this.MILLISECONDS_IN_A_DAY)
    yesterdayWithNewTime.setHours(hours, minutes, 0, 0)
    return yesterdayWithNewTime
  }

  toHHmm(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  }
}
```

**3. Stub Implementation for Testing** (`infra/date-provider/stub.date-provider.ts`):

```typescript
export class StubDateProvider implements DateProvider {
  private stubbedNow: Date = new Date('2025-01-15T10:00:00Z')

  setNow(date: Date): void {
    this.stubbedNow = date
  }

  setNowFromString(dateString: string): void {
    this.stubbedNow = new Date(dateString)
  }

  getNow(): Date {
    return this.stubbedNow
  }

  getISOStringNow(): string {
    return this.stubbedNow.toISOString()
  }

  // ... other methods use stubbedNow instead of real time
}
```

**4. Testable Business Logic**:

```typescript
// ✅ Testable - uses injected DateProvider
function isSessionActive(session: BlockSession, dateProvider: DateProvider): boolean {
  const now = dateProvider.getNow()
  return now >= session.startTime && now <= session.endTime
}

// Test with controlled time
it('session is active at 10:00', () => {
  const dateProvider = new StubDateProvider()
  dateProvider.setNow(new Date('2025-01-15T10:00:00Z'))

  const session = {
    startTime: new Date('2025-01-15T09:00:00Z'),
    endTime: new Date('2025-01-15T17:00:00Z'),
  }

  expect(isSessionActive(session, dateProvider)).toBe(true)
})
```

**5. Dependency Injection**:

```typescript
// In dependency container
const dateProvider = new RealDateProvider()

// Inject into use cases
const createSessionUseCase = new CreateSessionUseCase(
  sessionRepository,
  dateProvider,  // <-- Injected
)
```

## Consequences

### Positive

- **Testable**: Can control time in unit tests
- **Deterministic**: Tests always produce same result
- **Edge case testing**: Easy to test midnight, timezones, leap seconds
- **Fast tests**: No waiting for real time to pass
- **Debugging**: Can simulate any time for debugging
- **Decoupled**: Business logic independent of system clock
- **Time travel**: Can test past or future scenarios
- **Explicit dependency**: Clear that code depends on time
- **Port abstraction**: Follows hexagonal architecture

### Negative

- **Indirection**: Extra layer of abstraction
- **Boilerplate**: Must inject provider instead of using `new Date()`
- **Learning curve**: Team must understand the pattern
- **More code**: Additional interface and implementations
- **Potential misuse**: Developers might forget to use provider

### Neutral

- **Consistency**: All time operations centralized
- **Convention**: Team must consistently use provider

## Alternatives Considered

### 1. Direct `new Date()` Usage

Use JavaScript's native Date API directly.

**Rejected because**:
- Untestable code
- Flaky tests
- Can't simulate specific times
- Tightly couples to system clock

### 2. Mock `Date` Globally (Jest/Vitest)

Mock the global `Date` object in tests.

**Rejected because**:
- Fragile (global state)
- Can break test utilities that also use Date
- Doesn't work with all test runners
- Implicit dependency (harder to understand)
- Requires test setup/teardown

### 3. Pass `Date` as Parameter

Pass `new Date()` as a parameter to every function.

```typescript
function isSessionActive(session: BlockSession, now: Date): boolean {
  return now >= session.startTime && now <= session.endTime
}
```

**Rejected because**:
- Pollutes function signatures
- Caller burden (must remember to pass date)
- Doesn't help with nested calls
- Verbose and repetitive

### 4. Time Utilities Library (moment.js, date-fns)

Use a third-party date library.

**Rejected because**:
- Doesn't solve testability problem
- Adds bundle size
- Still need abstraction for testing
- Date Provider can use these libraries internally if needed

### 5. Singleton Clock Service

Global singleton that can be swapped for testing.

**Rejected because**:
- Global state makes tests harder
- Implicit dependency
- Doesn't follow hexagonal architecture principles
- Harder to reason about

## Implementation Notes

### Domain-Specific Methods

The DateProvider includes app-specific time operations:

- `getMinutesFromNow()`: For scheduling notifications
- `recoverDate()`: Convert "HH:mm" string to today's Date
- `recoverYesterdayDate()`: Handle midnight rollovers
- `toHHmm()`: Format Date as "HH:mm" for display

These could be separate utilities, but centralizing in DateProvider:
- Ensures consistent time handling
- All testable with same stub
- Clear single source of truth

### Testing Patterns

**Setup specific time**:
```typescript
const dateProvider = new StubDateProvider()
dateProvider.setNow(new Date('2025-01-15T14:30:00Z'))
```

**Test time-sensitive logic**:
```typescript
it('activates session at start time', () => {
  const dateProvider = new StubDateProvider()
  dateProvider.setNow(new Date('2025-01-15T09:00:00Z'))

  const session = createSession('09:00', '17:00')
  expect(isActive(session, dateProvider)).toBe(true)
})

it('deactivates session after end time', () => {
  const dateProvider = new StubDateProvider()
  dateProvider.setNow(new Date('2025-01-15T17:01:00Z'))

  const session = createSession('09:00', '17:00')
  expect(isActive(session, dateProvider)).toBe(false)
})
```

**Test midnight rollover**:
```typescript
it('handles session spanning midnight', () => {
  const dateProvider = new StubDateProvider()
  dateProvider.setNow(new Date('2025-01-15T23:30:00Z'))

  const session = createSession('22:00', '02:00')
  expect(isActive(session, dateProvider)).toBe(true)
})
```

### Real-World Usage

```typescript
// In a use case
export class CreateBlockSessionUseCase {
  constructor(
    private repository: BlockSessionRepository,
    private dateProvider: DateProvider,
  ) {}

  async execute(params: CreateSessionParams): Promise<BlockSession> {
    const now = this.dateProvider.getNow()
    const startTime = this.dateProvider.recoverDate(params.startTime)

    if (startTime < now) {
      throw new Error('Cannot create session in the past')
    }

    const session = {
      id: generateId(),
      name: params.name,
      startedAt: params.startTime,
      endedAt: params.endTime,
      createdAt: this.dateProvider.getISOStringNow(),
    }

    return this.repository.save(session)
  }
}
```

### When NOT to Use DateProvider

- **Pure functions**: Functions that only manipulate passed dates
- **Display formatting**: UI components formatting existing dates
- **Static dates**: Hardcoded timestamps for test fixtures

### Migration Strategy

1. **Add DateProvider port**: Define interface
2. **Create implementations**: Real and Stub
3. **Inject into use cases**: Update constructors
4. **Replace direct Date usage**: Find and replace `new Date()`
5. **Update tests**: Use StubDateProvider

## Related ADRs

- [Hexagonal Architecture](../core/hexagonal-architecture.md) - Port/adapter pattern
- [Dependency Injection Pattern](../core/dependency-injection-pattern.md)
- [Stub vs Fake Implementations](../testing/stub-vs-fake-implementations.md)

## References

- [Clock abstraction pattern](https://blog.ploeh.dk/2014/05/19/di-friendly-framework/)
- [Dealing with time in tests](https://martinfowler.com/articles/mocksArentStubs.html)
- Implementation: `infra/date-provider/real.date-provider.ts`

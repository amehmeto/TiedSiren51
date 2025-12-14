# Stub vs Fake Implementations for Test Doubles

Date: 2025-01-28

## Status

Accepted

## Context

TiedSiren51's hexagonal architecture allows swapping real infrastructure with test doubles. Two main types of test doubles are needed:

**Test Double Types**:
- **Stub**: Minimal implementation that returns hard-coded responses
- **Fake**: Functional implementation with simplified logic
- **Mock**: Tracks calls and verifies behavior (less common in our tests)
- **Spy**: Wraps real implementation to observe calls

**When to use each**:
- Some tests need simple, predictable responses (stubs)
- Other tests need functional behavior without real infrastructure (fakes)
- Must balance simplicity vs realism

**Examples in our codebase**:
- `StubDateProvider` - Returns controllable dates
- `FakeAuthGateway` - In-memory auth with working login/logout
- `FakeDataBlockSessionRepository` - Array-based storage that actually works

## Decision

Use **both stubs and fakes** based on test needs:

### Stubs: For Deterministic Responses

**When to use**:
- Testing logic that depends on external data
- Need predictable, controllable responses
- Don't care about side effects
- Testing error scenarios

**Implementation**:
```typescript
// /infra/date-provider/stub.date-provider.ts
export class StubDateProvider implements DateProvider {
  private currentDate = new Date('2025-01-28T12:00:00Z')

  now(): Date {
    return this.currentDate
  }

  setDate(date: Date): void {
    this.currentDate = date
  }
}

// Usage:
const dateProvider = new StubDateProvider()
dateProvider.setDate(new Date('2025-01-01'))

// Test time-dependent logic with fixed time
```

### Fakes: For Behavioral Testing

**When to use**:
- Testing workflows that span multiple operations
- Need realistic behavior without real infrastructure
- Testing state changes
- Integration-style tests

**Implementation**:
```typescript
// /infra/auth-gateway/fake.auth.gateway.ts
export class FakeAuthGateway implements AuthGateway {
  private users = new Map<string, AuthUser>()
  private currentUser: AuthUser | null = null

  async login(email: string, password: string): Promise<AuthUser> {
    const user = Array.from(this.users.values())
      .find(u => u.email === email)

    if (!user) {
      throw new Error('User not found')
    }

    this.currentUser = user
    return user
  }

  async logout(): Promise<void> {
    this.currentUser = null
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    return this.currentUser
  }

  // Test helper
  addUser(user: AuthUser): void {
    this.users.set(user.id, user)
  }
}

// Usage:
const authGateway = new FakeAuthGateway()
authGateway.addUser({ id: '1', email: 'test@example.com' })
await authGateway.login('test@example.com', 'password')
```

## Consequences

### Positive

- **Clarity**: Clear distinction between simple (stub) and functional (fake)
- **Flexibility**: Choose appropriate double for test needs
- **Speed**: Both faster than real implementations
- **Determinism**: Tests are predictable and repeatable
- **Isolation**: Tests don't depend on external services
- **Simplicity**: Stubs are trivial to implement
- **Realism**: Fakes provide realistic behavior
- **No side effects**: No database writes, no network calls
- **Easy debugging**: Simpler implementations easier to debug

### Negative

- **Maintenance**: Must maintain test doubles alongside real implementations
- **Drift risk**: Fakes can diverge from real implementation behavior
- **More code**: Extra implementations to write and maintain
- **Naming confusion**: Team must understand stub vs fake distinction
- **Incomplete coverage**: Fakes might not cover all edge cases

### Neutral

- **Trade-off**: Test speed/simplicity vs realism
- **Strategy**: Different tests need different doubles

## Alternatives Considered

### 1. Only Mocks (Jest-style)
**Rejected because**:
```typescript
const mockRepository = {
  save: jest.fn(),
  findAll: jest.fn().mockResolvedValue([]),
}
```
- Less explicit behavior
- Couples tests to implementation details
- Harder to read
- Verbose setup in every test

### 2. Only Fakes (No Stubs)
**Rejected because**:
- Overkill for simple tests
- Harder to control specific scenarios
- Time control (dates) awkward with fake

### 3. Only Stubs (No Fakes)
**Rejected because**:
- Can't test workflows
- Must set up every method call
- Tests become brittle
- Hard to test state changes

### 4. Always Use Real Implementations
**Rejected because**:
- Slow tests
- External dependencies
- Hard to test error scenarios
- Flaky tests

## Implementation Notes

### Key Files
- `/infra/date-provider/stub.date-provider.ts` - StubDateProvider
- `/infra/database-service/stub.database.service.ts` - StubDatabaseService
- `/infra/auth-gateway/fake.auth.gateway.ts` - FakeAuthGateway
- `/infra/*-repository/fake-data.*.ts` - Repository fakes
- `/core/_tests_/createTestStore.ts` - Uses both stubs and fakes

### Naming Conventions

**Stubs**:
- Prefix: `Stub`
- Example: `StubDateProvider`, `StubDatabaseService`
- Location: Colocated with real implementations in `/infra/{service}/`

**Fakes**:
- Prefix: `Fake` or `FakeData`
- Example: `FakeAuthGateway`, `FakeDataBlockSessionRepository`
- Location: Colocated with real implementations in `/infra/{service}/`

**Note**: Test doubles are colocated with their real implementations rather than centralized in `/core/_tests_/`. This keeps related code together and makes it easier to maintain test doubles when the real implementation changes.

### Decision Matrix

| Scenario | Use Stub | Use Fake |
|----------|----------|----------|
| Need fixed date/time | ✅ | |
| Testing auth flow | | ✅ |
| Testing CRUD operations | | ✅ |
| Testing error handling | ✅ | |
| Need state changes | | ✅ |
| Simple return value | ✅ | |
| Multi-step workflow | | ✅ |
| Performance test | ✅ | |

### Stub Examples

**Date Provider Stub**:
```typescript
export class StubDateProvider implements DateProvider {
  private _now = new Date()

  now(): Date {
    return this._now
  }

  setNow(date: Date): void {
    this._now = date
  }

  advanceBy(ms: number): void {
    this._now = new Date(this._now.getTime() + ms)
  }
}

// Test:
const dateProvider = new StubDateProvider()
dateProvider.setNow(new Date('2025-01-01'))

// Session started at specific time
const session = startSession()
expect(session.startTime).toEqual(new Date('2025-01-01'))
```

**Database Service Stub**:
```typescript
export class StubDatabaseService implements DatabaseService {
  async initialize(): Promise<void> {
    // No-op
  }

  async close(): Promise<void> {
    // No-op
  }

  isInitialized(): boolean {
    return true // Always ready
  }
}
```

### Fake Examples

**Auth Gateway Fake**:
```typescript
export class FakeAuthGateway implements AuthGateway {
  private users = new Map<string, AuthUser>()
  private currentUser: AuthUser | null = null

  async login(email: string, password: string): Promise<AuthUser> {
    const user = this.findUserByEmail(email)
    if (!user || user.password !== password) {
      throw new AuthError('Invalid credentials')
    }
    this.currentUser = user
    return user
  }

  async logout(): Promise<void> {
    this.currentUser = null
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    return this.currentUser
  }

  // Test helpers
  addUser(user: AuthUser): void {
    this.users.set(user.id, user)
  }

  reset(): void {
    this.users.clear()
    this.currentUser = null
  }
}
```

**Repository Fake**:
```typescript
export class FakeDataBlockSessionRepository implements BlockSessionRepository {
  private sessions: BlockSession[] = []

  async save(session: BlockSession): Promise<void> {
    this.sessions.push(session)
  }

  async findAll(): Promise<BlockSession[]> {
    return [...this.sessions]
  }

  async findById(id: string): Promise<BlockSession | null> {
    return this.sessions.find(s => s.id === id) || null
  }

  async update(id: string, changes: Partial<BlockSession>): Promise<void> {
    const index = this.sessions.findIndex(s => s.id === id)
    if (index !== -1) {
      this.sessions[index] = { ...this.sessions[index], ...changes }
    }
  }

  async delete(id: string): Promise<void> {
    this.sessions = this.sessions.filter(s => s.id !== id)
  }

  // Test helper
  reset(): void {
    this.sessions = []
  }
}
```

### Test Store Usage

```typescript
// /core/_tests_/createTestStore.ts
export const createTestStore = (
  preloadedState?: RootState,
  dependencyOverrides?: Partial<Dependencies>
) => {
  const testDependencies: Dependencies = {
    // Stubs for simple dependencies
    dateProvider: new StubDateProvider(),
    databaseService: new StubDatabaseService(),

    // Fakes for behavioral dependencies
    authGateway: new FakeAuthGateway(),
    blockSessionRepository: new FakeDataBlockSessionRepository(),
    blocklistRepository: new FakeDataBlocklistRepository(),
    sirensRepository: new FakeDataSirensRepository(),

    // Override with test-specific doubles
    ...dependencyOverrides,
  }

  return createStore(testDependencies, preloadedState)
}
```

### Related ADRs
- [Dependency Injection Pattern](../core/dependency-injection-pattern.md)
- [Test Store Factory](test-store-factory.md)
- [Fixture Pattern](fixture-pattern.md)
- [Hexagonal Architecture](../hexagonal-architecture.md)

## References

- [Test Doubles (Martin Fowler)](https://martinfowler.com/bliki/TestDouble.html)
- [Mocks Aren't Stubs](https://martinfowler.com/articles/mocksArentStubs.html)
- `/core/_tests_/` - Implementations

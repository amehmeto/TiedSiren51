# Repository Pattern for Data Access

Date: 2025-01-28

## Status

Accepted

## Context

TiedSiren51's hexagonal architecture requires abstracting data access from the core business logic:

- **Separation of concerns**: Core shouldn't know about Prisma, SQLite, or any specific database
- **Testability**: Need to swap real database with in-memory fakes for testing
- **Flexibility**: Should be able to change database technology without touching core
- **Type safety**: Data access operations should be type-safe
- **Consistency**: All domains should access data the same way

The core layer defines what data operations are needed, but shouldn't know how they're implemented.

## Decision

Implement the **Repository Pattern** to abstract all data access operations.

### Structure

**1. Port Interfaces** (in `/core/_ports_/`)

```typescript
// Core defines what it needs
export interface IBlockSessionRepository {
  save(session: BlockSession): Promise<void>
  findById(id: string): Promise<BlockSession | null>
  findAll(): Promise<BlockSession[]>
  update(id: string, changes: Partial<BlockSession>): Promise<void>
  delete(id: string): Promise<void>
}
```

**2. Adapter Implementations** (in `/infra/`)

```typescript
// Infrastructure provides how it's done
export class PrismaBlockSessionRepository implements IBlockSessionRepository {
  constructor(private prisma: PrismaClient) {}

  async save(session: BlockSession): Promise<void> {
    await this.prisma.blockSession.create({
      data: session,
    })
  }

  async findById(id: string): Promise<BlockSession | null> {
    return await this.prisma.blockSession.findUnique({
      where: { id },
    })
  }

  // ... other methods
}
```

**3. Abstract Base Repository** (`/infra/__abstract__/prisma.repository.ts`)

Shared functionality for all Prisma repositories:
- Database initialization
- Platform-specific path handling
- Common Prisma client setup
- Error handling patterns

**4. Multiple Implementations**

Production:
- `PrismaBlockSessionRepository` - Real database
- `PrismaBlocklistRepository` - Real database
- `PrismaSirensRepository` - Real database

Testing:
- `FakeDataBlockSessionRepository` - In-memory array
- `FakeDataBlocklistRepository` - In-memory array
- `FakeSirensRepository` - In-memory array

**5. Dependency Injection**

```typescript
// Core receives repository via DI
export const loadBlockSessions = createAppAsyncThunk(
  'blockSession/load',
  async (_, { extra }) => {
    const sessions = await extra.blockSessionRepository.findAll()
    return sessions
  }
)
```

## Consequences

### Positive

- **Decoupling**: Core doesn't depend on Prisma or any database
- **Testability**: Easy to swap real database with fake for tests
- **Flexibility**: Can change database without touching business logic
- **Type safety**: Repository interface enforces type contracts
- **Consistency**: All data access follows same pattern
- **Single Responsibility**: Repositories only handle data access
- **Easy migration**: Migrated from PouchDB to Prisma by swapping repositories
- **Clean architecture**: Respects hexagonal architecture boundaries
- **Reusability**: Same repository interface can have multiple implementations
- **Encapsulation**: Database-specific logic hidden from core

### Negative

- **Indirection**: Extra layer between business logic and database
- **Boilerplate**: Interface + implementation for each repository
- **Learning curve**: Team must understand repository abstraction
- **Over-engineering**: Simple CRUD might not need abstraction
- **Performance overhead**: Small (one function call), but exists
- **Maintenance**: Must keep interface and implementation in sync

### Neutral

- **Trade-off**: Flexibility vs simplicity
- **Abstraction level**: Repository is relatively low-level (not domain service)

## Alternatives Considered

### 1. Direct Prisma Usage in Core
**Rejected because**:
- Couples core to Prisma
- Impossible to test without real database
- Violates hexagonal architecture
- Hard to migrate database technology

### 2. DAO (Data Access Object) Pattern
**Rejected because**:
- Essentially same as repository (naming difference)
- Repository more common in DDD/hexagonal contexts

### 3. Active Record Pattern
**Rejected because**:
- Couples domain models to persistence
- Business logic mixed with data access
- Harder to test
- Not idiomatic for functional/Redux style

### 4. Query Builder in Core
**Rejected because**:
- Core would know about database queries
- Not truly abstracted
- Hard to swap implementations

### 5. Generic Repository
**Rejected because**:
- `Repository<T>` too generic for domain-specific queries
- Loses type safety for complex operations
- Doesn't express domain language

## Implementation Notes

### Key Files
- `/core/_ports_/IBlockSessionRepository.ts` - Interface
- `/core/_ports_/IBlocklistRepository.ts` - Interface
- `/core/_ports_/ISirensRepository.ts` - Interface
- `/infra/block-session-repository/prisma.block-session.repository.ts` - Implementation
- `/infra/blocklist-repository/prisma.blocklist.repository.ts` - Implementation
- `/infra/siren-repository/prisma.sirens-repository.ts` - Implementation
- `/infra/__abstract__/prisma.repository.ts` - Base class

### Repository Interface Pattern

```typescript
export interface I{Domain}Repository {
  // CRUD operations
  save(item: Domain): Promise<void>
  findById(id: string): Promise<Domain | null>
  findAll(): Promise<Domain[]>
  update(id: string, changes: Partial<Domain>): Promise<void>
  delete(id: string): Promise<void>

  // Domain-specific queries
  findActiveByUserId(userId: string): Promise<Domain[]>
  findByDateRange(start: Date, end: Date): Promise<Domain[]>
}
```

### Abstract Repository Benefits

```typescript
// /infra/__abstract__/prisma.repository.ts
export abstract class PrismaRepository {
  protected prisma: PrismaClient

  async initialize(): Promise<void> {
    // Shared initialization logic
    // Platform-specific database path
    // Migration handling
  }

  protected handleError(error: unknown): never {
    // Shared error handling
  }
}

// Domain repositories extend base
export class PrismaBlockSessionRepository extends PrismaRepository
  implements IBlockSessionRepository {
  // Inherits initialization, error handling, etc.
}
```

### Testing Pattern

```typescript
// Test with fake repository
const fakeRepository = new FakeDataBlockSessionRepository()
const store = createTestStore(undefined, {
  blockSessionRepository: fakeRepository,
})

await store.dispatch(loadBlockSessions())

expect(fakeRepository.saveWasCalled).toBe(true)
```

### Domain-Specific Methods

Repositories can have domain-specific queries beyond basic CRUD:

```typescript
export interface IBlockSessionRepository {
  // ... basic CRUD

  // Domain-specific
  findActiveSession(): Promise<BlockSession | null>
  findSessionsByBlocklistId(blocklistId: string): Promise<BlockSession[]>
  findCompletedSessionsInRange(start: Date, end: Date): Promise<BlockSession[]>
}
```

### Related ADRs
- [Hexagonal Architecture](../hexagonal-architecture.md)
- [Dependency Injection Pattern](dependency-injection-pattern.md)
- [Prisma ORM with SQLite](../data-persistence/prisma-orm-sqlite.md)

## References

- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [DDD Repository](https://docs.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design)
- `/core/_ports_/` - Port interfaces
- `/infra/` - Adapter implementations

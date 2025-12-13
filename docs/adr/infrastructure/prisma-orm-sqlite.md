# Prisma ORM with SQLite for Local-First Persistence

Date: 2025-01-28

## Status

Accepted

## Context

TiedSiren51 requires local-first data persistence for:

- Block sessions with timing information
- Blocklists containing collections of sirens
- Siren definitions (apps, websites, keywords to block)
- Remote device configurations
- User data and preferences

Requirements:
- **Offline-first**: App must work without network connectivity
- **Local storage**: Data stored on device, not in cloud
- **Type safety**: Database schema and queries should be type-safe
- **React Native compatible**: Must work on iOS and Android
- **Relational data**: Blocklists contain sirens, sessions reference blocklists
- **Migration support**: Schema changes need safe migration path
- **Testability**: Easy to test with in-memory or mock databases

Initial implementation used PouchDB, but it had limitations around type safety, complex queries, and React Native compatibility.

## Decision

Use **Prisma ORM** with **SQLite** as the primary data persistence solution.

### Implementation Details

1. **Schema Definition** (`/schema.prisma`)
   - Type-safe schema with models: User, BlockSession, Blocklist, Device, Siren
   - Relationships defined explicitly (blocklists → sirens, sessions → blocklists)
   - Platform-specific datasource configuration

2. **Prisma Client Generation**
   - Generated TypeScript client with full type inference
   - Command: `npx prisma generate`
   - Regenerated after schema changes

3. **Repository Pattern** (`/infra/*-repository/`)
   - Abstract base: `/infra/__abstract__/prisma.repository.ts`
   - Domain repositories: `PrismaBlockSessionRepository`, `PrismaBlocklistRepository`, etc.
   - Implements port interfaces from `/core/_ports_/`

4. **Database Service** (`/infra/database-service/`)
   - `PrismaDatabaseService` handles initialization
   - Platform-specific paths (iOS vs Android)
   - Manages Prisma client lifecycle

5. **Platform-Specific Paths**
   - Android: `${FileSystem.documentDirectory}databases/app.db`
   - iOS: `${FileSystem.documentDirectory}app.db`

### Migration from PouchDB

- PouchDB implementation moved to test-only status
- Prisma repositories replace PouchDB repositories
- Same port interfaces maintained (clean adapter swap)

## Consequences

### Positive

- **Type safety**: Full TypeScript types for all database operations
- **Developer experience**: Auto-completion for queries and schema
- **Relational queries**: Proper JOIN support via Prisma relations
- **Migration tooling**: Prisma Migrate for schema evolution
- **Query builder**: Type-safe, composable query API
- **React Native support**: `@prisma/react-native` package works well
- **Schema visibility**: Single source of truth in `schema.prisma`
- **Testing support**: Can use in-memory SQLite for tests
- **Performance**: SQLite is fast and lightweight
- **No network dependency**: Truly offline-first
- **Transactions**: Built-in transaction support
- **Validation**: Schema constraints enforced at database level

### Negative

- **Bundle size**: Prisma client adds to app bundle (~500KB+)
- **Generated code**: Prisma client must be regenerated after schema changes
- **Platform complexity**: Different database paths for iOS/Android require configuration
- **No cloud sync**: Pure local storage, no built-in replication (PouchDB had this)
- **Migration risk**: Schema changes require careful migration strategy
- **React Native limitations**: Some Prisma features don't work on mobile (raw SQL edge cases)
- **Build setup**: Requires `npx prisma generate` in CI/CD and post-install
- **Test complexity**: Prisma tests currently excluded due to polyfill conflicts
- **First-time setup**: Requires `expo prebuild` before Prisma works

### Neutral

- **SQLite choice**: Standard, reliable, but limited compared to PostgreSQL
- **Learning curve**: Team needs to learn Prisma schema language
- **Vendor lock-in**: Harder to migrate away from Prisma than raw SQL

## Alternatives Considered

### 1. PouchDB (Previous Solution)
**Replaced because**:
- Weak TypeScript support (runtime type issues)
- Document-oriented (awkward for relational data)
- Complex query API
- React Native polyfill issues
- Larger bundle size
- Sync features unused (we're local-only)

### 2. WatermelonDB
**Rejected because**:
- Less mature than Prisma
- Custom query language (not standard SQL)
- Smaller community
- Manual schema migrations more complex
- Weaker type generation

### 3. SQLite with raw queries
**Rejected because**:
- No type safety
- Manual migration management
- Verbose query code
- Error-prone (SQL injection risk, typos)
- No schema validation

### 4. Realm
**Rejected because**:
- MongoDB ecosystem (not ideal for relational data)
- Heavier weight than SQLite
- Different mental model (object database)
- Lock-in to Realm platform

### 5. AsyncStorage + JSON
**Rejected because**:
- No relational queries
- Manual data normalization
- Poor performance for complex queries
- No transactions
- No type safety for stored data

## Implementation Notes

### Key Files
- `/schema.prisma` - Database schema definition
- `/infra/__abstract__/prisma.repository.ts` - Base repository class
- `/infra/block-session-repository/prisma.block-session.repository.ts` - Block session data access
- `/infra/blocklist-repository/prisma.blocklist.repository.ts` - Blocklist data access
- `/infra/siren-repository/prisma.sirens-repository.ts` - Siren data access
- `/infra/database-service/prisma.database.service.ts` - Database initialization

### Schema Example
```prisma
model BlockSession {
  id              String      @id
  userId          String
  startTime       DateTime
  endTime         DateTime?
  blocklistIds    String      // JSON array
  isActive        Boolean
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}
```

### Migration Strategy
<!-- TODO: Document planned improvements to migration process -->

### Known Issues
- Prisma integration tests excluded in vitest config due to polyfill conflicts
- Pattern: `infra/**/prisma.*.test.ts` excluded
- Tracked in TECH_DEBT.md #5

### Related ADRs
- [Repository Pattern](../core/repository-pattern.md)
- [Abandon PouchDB](abandon-pouchdb.md)
- [Local-First Architecture](local-first-architecture.md)
- [Platform-Specific Database Paths](platform-specific-db-paths.md)

## References

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma React Native](https://github.com/prisma/react-native-prisma)
- `/schema.prisma` - Current schema
- `/docs/TECH_DEBT.md` - Planned improvements

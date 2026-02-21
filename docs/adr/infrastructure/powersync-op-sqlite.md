# PowerSync + OP-SQLite for Local-First Persistence

Date: 2026-02-21

## Status

Accepted (Supersedes [Prisma ORM with SQLite](prisma-orm-sqlite.md))

## Context

`@prisma/react-native` C++ bindings are incompatible with React Native's New Architecture (prisma/react-native-prisma#58 -- open since Nov 2025, last release April 2024). Since Expo SDK 55 makes New Architecture mandatory, Prisma must be replaced before the SDK upgrade.

Requirements remain the same as the original Prisma decision:

- Offline-first local storage on device
- Type-safe database operations
- React Native compatible (iOS and Android)
- Relational data (blocklists contain sirens, sessions reference blocklists)
- Testability via fake/stub repositories

## Decision

Replace **Prisma ORM** with **PowerSync + OP-SQLite** in **local-only mode** (no backend sync).

### Key Design Choices

1. **Local-only mode**: `PowerSyncDatabase` is instantiated but `connect()` is never called. All CRUD uses `.execute()` / `.get()` / `.getAll()` directly.

2. **`localOnly: true` on all tables**: Bypasses PowerSync's upload queue entirely since we have no sync backend.

3. **Constructor injection**: Repositories receive the `AbstractPowerSyncDatabase` instance via constructor instead of inheriting from an abstract base class. This avoids the deep inheritance chain that made the Prisma base class complex.

4. **snake_case schema, camelCase domain**: PowerSync schema uses `started_at`, `ended_at`, etc. Repositories map between DB columns and TypeScript domain models.

5. **Explicit junction tables**: `block_session_blocklist` and `block_session_device` with indexed foreign keys replace Prisma's implicit M2M relations.

6. **Prisma files kept**: Following the [PouchDB precedent](abandon-pouchdb.md), obsolete Prisma files are kept for easy rollback. Cleanup tracked in a separate follow-up issue.

### Implementation Details

1. **Schema** (`/infra/database-service/powersync.schema.ts`)
   - 5 main tables: `siren`, `blocklist`, `block_session`, `device`, `timer`
   - 2 junction tables: `block_session_blocklist`, `block_session_device`
   - All tables marked `localOnly: true`
   - PowerSync auto-creates `id TEXT` primary key on every table

2. **Database Service** (`/infra/database-service/powersync.database.service.ts`)
   - Creates `PowerSyncDatabase` eagerly in constructor using `OPSqliteOpenFactory`
   - `initialize()` runs legacy Prisma data migration
   - Exposes `getDatabase()` for repository injection

3. **Repositories** (`/infra/*-repository/powersync.*.repository.ts`)
   - Each implements the same port interface as its Prisma predecessor
   - Constructor: `(db: AbstractPowerSyncDatabase, logger: Logger)`
   - Raw SQL queries via PowerSync's `.execute()`, `.get()`, `.getAll()`, `.getOptional()`
   - JSON serialization for `sirens` (Blocklist) and `blockingConditions` (BlockSession)

4. **Legacy Migration** (`/infra/database-service/powersync.legacy-migration.ts`)
   - Reads Prisma's `app.db` via OP-SQLite raw connection
   - Maps camelCase columns to snake_case and `"A"`/`"B"` junction columns to explicit foreign keys
   - Renames old file to `app.db.migrated` on success
   - Uses `ps_kv` flag to skip migration on subsequent launches

### Migration from Prisma

- Prisma files moved to obsolete status (not deleted)
- Same port interfaces maintained (clean adapter swap)
- `ui/dependencies.ts` updated to construct PowerSync repositories

## Consequences

### Positive

- **New Architecture compatible**: OP-SQLite works with React Native's New Architecture
- **Simpler architecture**: No abstract base class, no platform-specific path logic in repos
- **Future sync ready**: PowerSync can connect to a backend later without changing repos
- **Smaller bundle impact**: OP-SQLite is lightweight compared to Prisma client
- **Better SQL control**: Raw SQL gives full control over queries and transactions
- **Active maintenance**: PowerSync and OP-SQLite are actively maintained

### Negative

- **No type-safe queries**: Raw SQL strings instead of Prisma's typed query builder
- **Manual schema management**: No migration tooling like Prisma Migrate
- **Learning curve**: Team must learn PowerSync API and raw SQL patterns
- **No generated types**: Domain types in `core/` are the source of truth (no Prisma client generation)

### Neutral

- **Still local-first**: Both are local databases
- **Repository pattern unchanged**: Same interfaces, different implementations
- **Testing strategy unchanged**: Unit tests use fakes, no infra dependency

## Alternatives Considered

### 1. Keep Prisma (Wait for Fix)

**Rejected because**: No timeline for New Architecture support; blocks SDK upgrade indefinitely.

### 2. WatermelonDB

**Rejected because**: Custom query language, smaller community, more complex setup than PowerSync.

### 3. Raw OP-SQLite (No PowerSync)

**Rejected because**: PowerSync adds schema management, reactive queries, and future sync capability for minimal overhead.

### 4. Expo SQLite

**Rejected because**: Less mature than OP-SQLite, fewer features, no sync path.

## Related ADRs

- [Prisma ORM with SQLite](prisma-orm-sqlite.md) (superseded)
- [Abandon PouchDB](abandon-pouchdb.md) (precedent for keeping obsolete adapters)
- [Repository Pattern](../core/repository-pattern.md)
- [Local-First Architecture](local-first-architecture.md)

## References

- [PowerSync React Native SDK](https://docs.powersync.com/client-sdks/reference/react-native-and-expo)
- [PowerSync Local-Only Usage](https://docs.powersync.com/usage/use-case-examples/offline-only-usage)
- [OP-SQLite](https://github.com/nicoleibarra/op-sqlite)
- [Prisma New Architecture Issue](https://github.com/prisma/react-native-prisma/issues/58)

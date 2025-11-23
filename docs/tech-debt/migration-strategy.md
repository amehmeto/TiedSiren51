# Migration Strategy

**Priority**: ⚠️ **MEDIUM**
**Effort**: High
**Status**: Open
**Created**: January 28, 2025
**⚠️ Critical Before**: First app update with schema changes

## Problem Statement

Currently there is **no documented strategy** for handling database migrations when:
- App updates include schema changes
- Users upgrade from older app versions
- Need to add/remove/modify database fields

**Critical Risk**: Without a migration strategy, users could lose data on app updates.

## Current Situation

Prisma migrations work in development:
```bash
npx prisma migrate dev
```

But mobile apps require a different approach:
- ❌ Can't run migrations during app update (user might be offline)
- ❌ Can't assume database will be fresh on every install
- ❌ Must preserve existing user data
- ❌ Must handle users skipping app versions

## Scenarios to Handle

### Scenario 1: User Upgrading One Version
```
v1.0 (schema v1) → v1.1 (schema v2)
```
**Solution needed**: Run migration v1→v2 on app startup

### Scenario 2: User Skipping Versions
```
v1.0 (schema v1) → v1.5 (schema v5)
```
**Solution needed**: Run migrations v1→v2→v3→v4→v5 in order

### Scenario 3: Fresh Install
```
(no database) → v1.5 (schema v5)
```
**Solution needed**: Create database with schema v5 directly

### Scenario 4: Failed Migration
```
v1.0 → v1.1 (migration fails mid-way)
```
**Solution needed**: Rollback or recovery mechanism

## Proposed Solutions

### Option 1: Prisma Migrate Deploy (Recommended)

Use Prisma's built-in migration system adapted for mobile:

```typescript
// On app startup
export class DatabaseService {
  async initialize() {
    await this.runPendingMigrations()
    await this.baseClient.$connect()
  }

  private async runPendingMigrations() {
    try {
      // Prisma migrate deploy runs pending migrations
      await this.baseClient.$executeRawUnsafe(`
        -- Migrations are bundled with app
      `)
    } catch (error) {
      // Handle migration failure
      await this.handleMigrationFailure(error)
    }
  }
}
```

**Pros**:
- ✅ Uses Prisma's battle-tested migration system
- ✅ Handles version skipping automatically
- ✅ Migrations are SQL files (reviewable)

**Cons**:
- ⚠️ Requires bundling migration files with app
- ⚠️ Larger app size
- ⚠️ Complex rollback strategy needed

### Option 2: Manual Migration System

Build custom migration runner:

```typescript
// migrations/registry.ts
export const MIGRATIONS = [
  {
    version: 1,
    name: 'initial_schema',
    up: async (db: PrismaClient) => {
      // Create tables
    },
  },
  {
    version: 2,
    name: 'add_blocklist_color',
    up: async (db: PrismaClient) => {
      await db.$executeRaw`ALTER TABLE Blocklist ADD COLUMN color TEXT`
    },
  },
]

// migration-runner.ts
export class MigrationRunner {
  async run() {
    const currentVersion = await this.getCurrentVersion()
    const pendingMigrations = MIGRATIONS.filter(m => m.version > currentVersion)

    for (const migration of pendingMigrations) {
      await this.runMigration(migration)
    }
  }
}
```

**Pros**:
- ✅ Full control over migration process
- ✅ Can add custom logic (data transformations)
- ✅ Easier to test

**Cons**:
- ⚠️ Must maintain custom code
- ⚠️ Risk of bugs in migration logic
- ⚠️ More development effort

### Option 3: Schema Versioning with Adapters

Use adapter pattern to handle different schema versions:

```typescript
// Adapters translate between schema versions
export class BlocklistV1ToV2Adapter {
  adapt(v1Data: BlocklistV1): BlocklistV2 {
    return {
      ...v1Data,
      color: '#000000',  // Default color for old data
    }
  }
}
```

**Pros**:
- ✅ No actual database migrations needed
- ✅ Backward compatibility

**Cons**:
- ⚠️ Complex adapter logic
- ⚠️ Performance overhead
- ⚠️ Doesn't scale well

## Recommended Approach

**Hybrid Strategy**: Combine Option 1 (Prisma) with Option 2 (Custom runner)

1. Use Prisma migrations in development
2. Bundle migration SQL files with app
3. Custom migration runner executes them on app startup
4. Track schema version in database
5. Implement rollback for critical failures

## Implementation Plan

### Phase 1: Infrastructure (4-6 hours)
- [ ] Create migration version tracking table
- [ ] Build migration runner
- [ ] Add migration bundling to build process
- [ ] Create migration testing utilities

### Phase 2: Migration Files (2-3 hours)
- [ ] Document current schema as v1 baseline
- [ ] Create template for new migrations
- [ ] Set up migration review process

### Phase 3: App Integration (3-4 hours)
- [ ] Run migrations on app startup (after splash screen)
- [ ] Show migration progress to user if slow
- [ ] Handle migration failures gracefully
- [ ] Add analytics/logging for migrations

### Phase 4: Testing (4-6 hours)
- [ ] Test fresh install
- [ ] Test single-version upgrade
- [ ] Test multi-version upgrade (version skipping)
- [ ] Test failed migration recovery
- [ ] Test migration rollback

**Total Estimated Effort**: ~2-3 days

## Migration Checklist Template

For each new migration:
- [ ] Migration tested locally
- [ ] Migration is reversible (has down script)
- [ ] Large data migrations handle batching
- [ ] User data is preserved
- [ ] Migration has timeout handling
- [ ] Rollback plan documented
- [ ] Release notes mention schema change

## Trigger Point

**CRITICAL**: Must be implemented **before first app update with schema changes**.

Currently not blocking because:
- App is in early development
- No production users yet
- Schema is still evolving

**Address by**: Before first production release or when 100+ users in beta

## Related ADRs

- [Prisma ORM with SQLite](../adr/infrastructure/prisma-orm-sqlite.md)
- [Local-First Architecture](../adr/infrastructure/local-first-architecture.md)
- [Platform-Specific Database Paths](../adr/infrastructure/platform-specific-db-paths.md)

## References

- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Mobile Database Migrations](https://developer.android.com/training/data-storage/room/migrating-db-versions)
- [SQLite Migration Patterns](https://www.sqlite.org/lang_altertable.html)

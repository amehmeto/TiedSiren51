# Abandon PouchDB in Favor of Prisma

Date: 2025-01-28

## Status

Accepted (Supersedes initial PouchDB decision).
All PouchDB code was deleted in TS-401. Both PouchDB and its successor Prisma
have been fully replaced by PowerSync + OP-SQLite.

## Context

TiedSiren51 initially adopted PouchDB for local-first data persistence:

**Why PouchDB Was Chosen Initially**:
- Document-oriented database
- Built-in replication/sync capabilities
- Offline-first by design
- Works on web and mobile

**Problems Encountered**:
- **Weak TypeScript support**: Runtime type issues, no compile-time safety
- **Document model awkward for relational data**: Sirens → Blocklists → Sessions relationships clumsy
- **Complex query API**: Map/reduce functions harder than SQL
- **React Native polyfill issues**: Required many polyfills, bundle size increased
- **Sync features unused**: We're local-only, don't need CouchDB sync
- **Larger bundle size**: ~1.5MB+ for features we don't use
- **Testing complexity**: Hard to create clean test databases
- **Migration difficulty**: Schema changes require custom migration scripts

**Evidence of PouchDB Remnants** (all deleted in TS-401):
- `/infra/siren-repository/pouchdb.sirens-repository.ts` — deleted
- All PouchDB test files — deleted
- All PouchDB dependencies — removed from package.json

## Decision

**Abandon PouchDB** and fully migrate to **Prisma ORM with SQLite**.

### Migration Actions

1. **Replace all PouchDB repositories** with Prisma repositories
2. **Remove PouchDB dependencies** from package.json
3. **Update tests** to use Prisma or fake repositories
4. **Keep PouchDB files temporarily** for reference but mark as deprecated
5. **Document decision** to prevent future PouchDB consideration

### What Changed

**Before (PouchDB)**:
```typescript
// Document-oriented
export class PouchDBSirensRepository implements ISirensRepository {
  async save(siren: Siren): Promise<void> {
    await this.db.put({
      _id: siren.id,
      ...siren,
    })
  }

  async findAll(): Promise<Siren[]> {
    const result = await this.db.allDocs({ include_docs: true })
    return result.rows.map(row => row.doc as Siren)
  }
}
```

**After (Prisma)**:
```typescript
// Type-safe ORM
export class PrismaSirensRepository implements ISirensRepository {
  async save(siren: Siren): Promise<void> {
    await this.prisma.siren.create({
      data: siren,
    })
  }

  async findAll(): Promise<Siren[]> {
    return await this.prisma.siren.findMany()
  }
}
```

## Consequences

### Positive

- **Type safety**: Full TypeScript support with Prisma
- **Better DX**: Auto-completion, type inference
- **Relational queries**: Native JOIN support via relations
- **Schema management**: Prisma Migrate for schema evolution
- **Smaller bundle**: SQLite + Prisma smaller than PouchDB
- **Simpler queries**: SQL-like queries vs map/reduce
- **Testing**: Easier to create test databases
- **Performance**: SQLite optimized for mobile
- **Standard SQL**: Familiar query language
- **No unused features**: Don't pay for sync we don't use

### Negative

- **Migration effort**: Refactor existing PouchDB code
- **No built-in sync**: Lost sync capability (but we didn't use it)
- **Learning curve**: Team must learn Prisma (but smaller than PouchDB quirks)
- **Different mental model**: Relational vs document (but matches our data better)
- **Sunk cost**: Time invested in PouchDB implementation lost

### Neutral

- **Still local-first**: Both are local databases
- **Repository pattern unchanged**: Same interfaces, different implementations
- **Testing strategy similar**: Still use fakes for testing

## Alternatives Considered

### 1. Keep PouchDB
**Rejected because**:
- Type safety issues critical for maintainability
- Bundle size and performance concerns
- Complex query API slowing development
- Sync features unused and unneeded

### 2. Dual Database Strategy
**Rejected because**:
- Complexity of maintaining two systems
- Data consistency challenges
- Increased bundle size
- No clear benefit

### 3. IndexedDB + Dexie
**Rejected because**:
- Still document-oriented (similar issues to PouchDB)
- More manual than Prisma
- No type generation
- Less mature for React Native

### 4. WatermelonDB
**Rejected because**:
- Less mature ecosystem
- Custom query language
- Smaller community than Prisma
- More complex setup

## Implementation Notes

### Key Changes

**Dependencies**:
```json
// Removed
"pouchdb": "^7.x",
"pouchdb-find": "^7.x",
"pouchdb-react-native": "^7.x",

// Added
"@prisma/client": "^4.x",
"@prisma/react-native": "^1.x",
```

**Repository Migration** (Prisma repositories also deleted in TS-401, replaced by PowerSync):
- ✅ `/infra/block-session-repository/powersync.block-session.repository.ts`
- ✅ `/infra/blocklist-repository/powersync.blocklist.repository.ts`
- ✅ `/infra/siren-repository/powersync.sirens-repository.ts`
- ✅ `/infra/device-repository/powersync.remote-device.repository.ts`

**Data Migration**:
- No production data to migrate (early development stage)
- Test data recreated with Prisma fixtures

### Lessons Learned

1. **Evaluate bundle size early**: PouchDB's size was warning sign
2. **Type safety is critical**: Runtime errors are expensive
3. **Use features you need**: Don't choose tech for unused features
4. **Relational fits better**: Our data is inherently relational
5. **Repository pattern saved us**: Clean swap thanks to abstraction

### Future Considerations

**If we need sync in future**:
- Cloud database + API (Firebase, Supabase)
- Custom sync layer over Prisma
- Prisma Pulse (real-time updates)

**Not**:
- Going back to PouchDB/CouchDB

### Related ADRs
- [Prisma ORM with SQLite](prisma-orm-sqlite.md)
- [Repository Pattern](../core/repository-pattern.md)
- [Local-First Architecture](local-first-architecture.md)

## References

- [Why We're Not Using PouchDB](https://github.com/pouchdb/pouchdb/issues/8438) - Community discussions
- [Prisma vs Document DBs](https://www.prisma.io/docs/concepts/database-connectors)
- `/infra/siren-repository/` - Migration example

# Performance Optimization

**Priority**: 📊 **LOW**
**Effort**: High
**Status**: Monitoring - Not Currently Needed
**Created**: January 28, 2025

## Problem Statement

Performance optimizations are **not currently needed** but should be considered when:
- Database operations take >100ms
- Database size exceeds 10MB
- User-reported slowness
- App ratings mention performance issues

## Current Performance Baseline

**To be measured when app has real usage data**:
- Database query times: TBD
- App startup time: TBD
- UI responsiveness: TBD
- Memory usage: TBD

## Potential Optimization Areas

### 1. Database Indexing

**When to consider**: When queries take >100ms

**Current state**: No strategic indexes on frequently queried fields

**Potential improvements**:

```sql
-- Add indexes on frequently queried columns
CREATE INDEX idx_blocklists_user_id ON Blocklists(userId);
CREATE INDEX idx_sessions_active ON BlockSessions(isActive);
CREATE INDEX idx_sessions_time ON BlockSessions(startedAt, endedAt);
```

**Benefit**: Faster queries for:
- User's blocklists
- Active sessions
- Time-based session queries

**Cost**: Slightly slower writes, more disk space

### 2. JSON Field Size Monitoring

**When to consider**: When JSON fields consistently >1KB

**Current state**: No size limits on JSON fields (sirens arrays)

**Potential issues**:
- Very large JSON fields slow down queries
- SQLite doesn't index JSON efficiently
- Parsing large JSON in JavaScript is slow

**Potential solutions**:
- Limit sirens per blocklist (e.g., max 100)
- Normalize JSON into separate tables
- Paginate large lists in UI

### 3. Connection Pooling

**When to consider**: When concurrent DB operations are common

**Current state**: New `PrismaClient` per repository

**Potential improvement**:

```typescript
// Singleton connection pool
export class DatabaseConnectionPool {
  private static instance: PrismaClient

  static getClient(): PrismaClient {
    if (!this.instance) {
      this.instance = new PrismaClient()
    }
    return this.instance
  }
}
```

**Benefit**: Reuse connections, faster operations

**Cost**: More complex lifecycle management

### 4. Query Optimization

**When to consider**: When N+1 query problems emerge

**Potential improvements**:
- Use Prisma's `include` for eager loading
- Batch queries where possible
- Add query result caching

**Example**:

```typescript
// ❌ N+1 queries
const sessions = await prisma.blockSession.findMany()
for (const session of sessions) {
  const blocklists = await prisma.blocklist.findMany({
    where: { sessionId: session.id }
  })
}

// ✅ Single query with include
const sessions = await prisma.blockSession.findMany({
  include: { blocklists: true }
})
```

### 5. Data Archiving Strategy

**When to consider**: When DB size >10MB or old data slows queries

**Potential approach**:
- Archive completed sessions older than 6 months
- Move to separate archive table or file
- Provide "view archive" feature if needed

### 6. React Native Performance

**When to consider**: When UI feels sluggish

**Potential improvements**:
- Virtualized lists for large siren lists
- Memoization of expensive selectors
- Reduce Redux state size
- Optimize re-renders

## Monitoring Plan

**Before optimizing, establish metrics**:

1. **Add Performance Tracking**:
   ```typescript
   // utils/performance.ts
   export function measureDbQuery<T>(
     name: string,
     query: () => Promise<T>
   ): Promise<T> {
     const start = Date.now()
     return query().then(result => {
       const duration = Date.now() - start
       if (duration > 100) {
         console.warn(`Slow query: ${name} took ${duration}ms`)
       }
       return result
     })
   }
   ```

2. **Track Database Size**:
   ```typescript
   async getDatabaseSize(): Promise<number> {
     const fileInfo = await FileSystem.getInfoAsync(this.dbPath)
     return fileInfo.size
   }
   ```

3. **User Analytics**:
   - Track app startup time
   - Monitor crash-free rate
   - Measure time-to-interactive

## When to Revisit

Trigger optimization when:
- ⚠️ **Database queries** consistently >100ms
- ⚠️ **Database size** >10MB
- ⚠️ **App startup time** >3 seconds
- ⚠️ **User complaints** about performance
- ⚠️ **App ratings** drop due to performance

## Implementation Plan (When Needed)

**Don't implement now** - wait for metrics to guide prioritization

When triggered:
1. **Measure first**: Identify actual bottlenecks
2. **Profile**: Use React Native profiler, SQLite query analyzer
3. **Prioritize**: Fix biggest impact items first
4. **Test**: Measure improvement after changes
5. **Monitor**: Ensure optimizations help in production

**Estimated Effort** (when needed): 1-2 weeks
- Depends on which optimizations are needed
- Profiling and measurement: 2-3 days
- Implementation: 3-5 days
- Testing and validation: 2-3 days

## Anti-Pattern Warning

⚠️ **Premature Optimization**: Don't optimize without data showing it's needed

Current approach is **correct**:
- Simple, readable code
- No unnecessary complexity
- Optimize when metrics indicate problems

## Related ADRs

- [Prisma ORM with SQLite](../adr/infrastructure/prisma-orm-sqlite.md)
- [Local-First Architecture](../adr/infrastructure/local-first-architecture.md)
- [Entity Adapter Normalization](../adr/core/entity-adapter-normalization.md)

## Status

**LOW PRIORITY** - Monitoring only. No action needed until metrics indicate problems.

This document serves as a **future reference** when optimization becomes necessary, not a current action item.

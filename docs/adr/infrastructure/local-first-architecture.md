# Local-First Architecture

Date: 2025-01-28

## Status

Accepted

## Context

TiedSiren51 is a productivity app that blocks distracting apps and websites during focus sessions. Users need:

- **Instant access**: App must work immediately, even without internet
- **Privacy**: Sensitive data about browsing/app habits should stay local
- **Reliability**: Can't depend on cloud availability
- **Performance**: Fast queries for real-time blocking decisions
- **Offline operation**: Core features work without connectivity

**Cloud-first approach issues**:
- Latency in blocking decisions (network round-trip)
- Dependency on backend availability
- Privacy concerns (user habits tracked server-side)
- Sync complexity when user has multiple devices
- Higher infrastructure costs

**Local-first benefits**:
- Immediate responsiveness
- Works offline
- Data stays on device
- No backend costs (for MVP)
- Simpler architecture

## Decision

Adopt **Local-First Architecture** where all app data is stored and accessed locally on device.

### Principles

**1. Local Storage as Source of Truth**
- SQLite database on device
- All CRUD operations happen locally
- No network calls for core features

**2. Immediate Writes**
- Changes saved to local DB immediately
- No queueing or delayed persistence
- Users see changes instantly

**3. Local Reads Only**
- All queries read from local database
- No API calls to fetch data
- Blocking decisions made locally

**4. Optional Cloud Sync** (Future)
- Cloud as backup/sync layer, not source of truth
- Local changes sync in background
- Conflicts resolved locally
- App works if sync fails

### Architecture

```
┌─────────────────────────────────────┐
│         UI Layer (React Native)      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     Core Layer (Redux + Business)   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Infra Layer (Repositories)        │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   SQLite (Prisma ORM)               │  ◄─── Local storage
└─────────────────────────────────────┘

(No cloud dependency for core features)
```

## Consequences

### Positive

- **Instant**: No network latency, immediate response
- **Reliable**: Works without internet connection
- **Private**: User data never leaves device
- **Fast**: Local DB queries are fast (microseconds)
- **Simple**: No backend infrastructure needed (MVP)
- **Offline-first**: Core value prop works offline
- **Cost effective**: No server/cloud costs
- **Data ownership**: Users own their data
- **No sync conflicts**: Single source of truth (device)
- **Predictable**: No network failures to handle

### Negative

- **No cross-device sync**: Data doesn't sync between devices (for MVP)
- **No cloud backup**: Data lost if device lost (for MVP)
- **No collaboration**: Can't share data with others
- **Device storage limits**: Limited by device capacity
- **No server-side processing**: All logic must run on device
- **Harder analytics**: Can't easily collect usage data
- **Migration complexity**: Future cloud sync will be complex to add

### Neutral

- **Trade-off**: Simplicity now vs sync features later
- **Future-facing**: Can add cloud sync later if needed

## Alternatives Considered

### 1. Cloud-First (Firebase, Supabase)
**Rejected because**:
- Requires internet for core feature (blocking)
- Latency unacceptable for real-time blocking
- Privacy concerns (user habits on server)
- Higher complexity and cost
- Offline mode harder to implement

### 2. Optimistic UI + API
**Rejected because**:
- Still requires sync logic
- Conflict resolution complexity
- Network errors to handle
- Latency on initial load
- More infrastructure

### 3. Hybrid (Local + Cloud)
**Rejected for MVP because**:
- Adds significant complexity
- Sync conflicts difficult
- Not needed for single-device use case
- Can be added later if needed

### 4. IndexedDB (Web Only)
**Rejected because**:
- Web-only solution
- React Native needs different storage
- Not our primary platform

## Implementation Notes

### Key Decisions

**Data Storage**:
- Prisma ORM + SQLite
- Platform-specific database paths
- Migrations handled by Prisma Migrate

**Data Access**:
- Repository pattern for all data operations
- All queries synchronous from app perspective
- Async database operations wrapped in promises

**No Backend** (for MVP):
- No authentication server (local auth only)
- No API endpoints
- No cloud storage
- Future: Can add backend for sync without changing core

### Future Cloud Sync Strategy

If/when needed:
1. **Local remains source of truth**
2. **Background sync** to cloud
3. **Conflict resolution** on device
4. **Graceful degradation** if sync fails
5. **Prisma Pulse** for real-time updates (potential)

### Data That Stays Local

- **Sirens**: Apps, websites, keywords to block
- **Blocklists**: User-created collections
- **Block Sessions**: History and active sessions
- **User Preferences**: Settings and configuration
- **Device Info**: Device-specific configuration

### Remote Devices Feature

Note: "Remote devices" in the app refers to devices the user can add to sessions (e.g., phone can block distractions on laptop), **NOT** cloud-synced devices. This is a local pairing feature.

### Performance Characteristics

```typescript
// Typical query times (local SQLite)
await repository.findAll()        // < 10ms for 1000 records
await repository.findById(id)     // < 1ms (indexed)
await repository.save(item)       // < 5ms

// Cloud API comparison (for reference)
await api.fetchAll()              // 100-500ms (network latency)
await api.fetchById(id)           // 50-200ms
await api.create(item)            // 100-500ms
```

### Testing Local-First

```typescript
// Tests don't need network mocking
it('blocks app during session', async () => {
  const store = createTestStore()

  await store.dispatch(startBlockSession({ blocklistId: '1' }))

  // ✅ No network, no mocking, instant
  expect(selectActiveSession(store.getState())).toBeDefined()
})
```

### Related ADRs
- [Prisma ORM with SQLite](prisma-orm-sqlite.md)
- [Abandon PouchDB](abandon-pouchdb.md)
- [Repository Pattern](../architecture/repository-pattern.md)

## References

- [Local-First Software](https://www.inkandswitch.com/local-first/)
- [Offline First](http://offlinefirst.org/)
- [CRDTs for Eventual Consistency](https://crdt.tech/)
- `/docs/TECH_DEBT.md` - Future sync considerations

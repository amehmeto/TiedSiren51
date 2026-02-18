# Local-First Architecture

Date: 2025-01-28

## Status

Accepted

## Context

TiedSiren51 blocks distracting apps and websites during timed focus sessions. The blocking engine runs on the Android AccessibilityService, which must make instant decisions about whether detected content is blocked. A network round-trip for each decision is not viable.

Key constraints:
- Blocking decisions must be sub-millisecond (no network latency)
- The app must function without internet connectivity
- User browsing/app habit data is privacy-sensitive

## Decision

All domain data (blocklists, block sessions, sirens, etc.) is persisted and queried locally via SQLite (Prisma ORM). Installed apps are detected at runtime by the `expo-list-installed-apps` native module — not stored in the database. The local database is the single source of truth for user-created data. Cloud services are used only for authentication (Firebase Auth), not for domain data storage.

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
│   SQLite (Prisma ORM)               │  ◄── Local storage
└─────────────────────────────────────┘

(No cloud dependency for core features)
```

### What is local

- **Sirens** — apps, websites, and keywords to block
- **Blocklists** — user-created collections of sirens
- **Block sessions** — timed focus sessions with start/end lifecycle
- **Timers** — session countdown state
- **Devices** — local pairing targets (not cloud-synced devices)

### What is remote

- **Firebase Auth** — email/password, Google Sign-In, email verification, password reset, account deletion. Auth tokens are persisted locally via AsyncStorage.

### Data access pattern

All domain repositories implement port interfaces defined in `core/_ports_/` and operate exclusively against local SQLite. The repository pattern means a future sync layer (e.g., PowerSync) could be introduced behind the same ports without changing core or UI code.

### Schema evolution

There are no Prisma Migrate migrations. Tables are created and evolved via raw SQL in `PrismaRepository.initialize()`:

1. `CREATE TABLE IF NOT EXISTS` for all tables on every app start
2. `PRAGMA table_info()` to detect missing or renamed columns
3. `ALTER TABLE ADD COLUMN` / `RENAME COLUMN` as needed

There is no migration version tracking — each migration is idempotent and detects whether it needs to run by inspecting the current schema.

## Consequences

**Positive**: Blocking decisions are instant with no network dependency. Core features work offline. Privacy-sensitive data stays on device. No backend infrastructure costs for data storage.

**Negative**: No cross-device data sync — data is lost if the device is lost. Schema migrations are manual and untested against upgrade paths. No database encryption — data is readable on rooted/jailbroken devices.

## Future: Cross-Device Sync via PowerSync

The planned evolution is to add [PowerSync](https://www.powersync.com/) as a sync layer so that local-first data replicates across all of a user's devices. PowerSync keeps SQLite as the local source of truth and syncs bidirectionally with a backend database, preserving the offline-first guarantees. The hexagonal architecture (repository ports in `core/_ports_/`) means the sync layer can be introduced behind existing interfaces without changing core or UI code.

## Alternatives Considered

1. **Cloud-first (Firestore / Supabase)** — Rejected. Network latency makes real-time blocking unreliable. Requires internet for core functionality.
2. **PouchDB** — Previously attempted, abandoned. See [Abandon PouchDB](abandon-pouchdb.md). Dead PouchDB repository implementations still exist in `infra/` but are not wired into the dependency graph.

## Related ADRs

- [Prisma ORM with SQLite](prisma-orm-sqlite.md)
- [Abandon PouchDB](abandon-pouchdb.md)
- [Platform-Specific Database Paths](platform-specific-db-paths.md)
- [Repository Pattern](../core/repository-pattern.md)

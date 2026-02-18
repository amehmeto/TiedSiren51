# Platform-Specific Database Paths

Date: 2025-01-28

## Status

Accepted

## Context

TiedSiren51 uses Prisma with SQLite on both iOS and Android. Prisma requires an absolute file path for its SQLite datasource. Each platform has different file system conventions:

- **iOS**: Apps store data in `~/Documents/` (backed up to iCloud by default)
- **Android**: Apps store data in `/data/data/<package>/files/`, with databases conventionally in a `/databases/` subdirectory

The path must be determined at runtime since both platforms are served from a single codebase.

## Decision

Determine the database path at runtime using `Platform.OS` in the abstract `PrismaRepository` base class. Android appends `databases/` to follow platform conventions; iOS writes directly to the document directory.

### Key files

- `/infra/__abstract__/prisma.repository.ts` — path resolution and initialization
- `/infra/database-service/prisma.database.service.ts` — thin wrapper implementing the `DatabaseService` port
- `/core/_ports_/database.service.ts` — port interface

### Path resolution (`PrismaRepository.getDbPath()`)

```typescript
public getDbPath() {
  return Platform.OS === 'android'
    ? `${FileSystem.documentDirectory}databases/${this.dbName}`
    : `${FileSystem.documentDirectory}${this.dbName}`
}
```

`FileSystem.documentDirectory` (from `expo-file-system`) returns a `file://` URI ending with `/`. The resulting path is passed to Prisma as `file:${dbPath}`.

### File and directory creation (`PrismaRepository.ensureDatabaseFile()`)

Before connecting, the base class checks if the database file exists. If not, it creates the parent directory (with `intermediates: true`) and writes an empty file:

```typescript
private async ensureDatabaseFile(): Promise<void> {
  const fileInfo = await FileSystem.getInfoAsync(this.dbPath)
  if (!fileInfo.exists) {
    const dirPath = this.dbPath.substring(0, this.dbPath.lastIndexOf('/'))
    await FileSystem.makeDirectoryAsync(dirPath, { intermediates: true })
    await FileSystem.writeAsStringAsync(this.dbPath, '', {
      encoding: FileSystem.EncodingType.UTF8,
    })
  }
}
```

### Initialization flow

`PrismaRepository.initialize()` runs sequentially:
1. `ensureDatabaseFile()` — create directory and empty file if needed
2. `connectToDatabase()` — `$connect()` + enable foreign keys
3. `createAllTables()` — raw SQL `CREATE TABLE IF NOT EXISTS` statements
4. `loadInitialData()` — warm the Prisma client cache

There are no Prisma migrations — tables are created and altered via raw SQL.

## Consequences

**Positive**: Single path-resolution point in the base class; follows each platform's conventions; directory auto-created on first run.

**Negative**: Platform check couples the code to `react-native`'s `Platform` API; different paths complicate on-device debugging.

## Alternatives Considered

1. **Single hardcoded path** — Would work on both platforms but ignores Android conventions for database location.
2. **Build-time configuration** — Unnecessary complexity; Expo already provides runtime platform detection.
3. **Environment variables** — Extra configuration burden with no benefit over `Platform.OS`.

## Related ADRs

- [Prisma ORM with SQLite](prisma-orm-sqlite.md)
- [Local-First Architecture](local-first-architecture.md)

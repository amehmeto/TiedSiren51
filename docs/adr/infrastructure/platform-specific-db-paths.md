# Platform-Specific Database Paths

Date: 2025-01-28

## Status

Accepted

## Context

TiedSiren51 runs on iOS and Android with SQLite database. Each platform has different file system conventions:

**iOS**:
- Apps sandboxed in application container
- Document directory: `~/Documents/`
- Files backed up to iCloud by default
- Path: `FileSystem.documentDirectory + 'app.db'`

**Android**:
- Apps sandboxed in `/data/data/<package>/`
- Multiple storage locations (internal, external, cache)
- Databases traditionally in `/databases/` subdirectory
- Path: `FileSystem.documentDirectory + 'databases/app.db'`

**Challenges**:
- Prisma needs absolute file path for SQLite datasource
- Path differs by platform
- Must ensure database directory exists
- File permissions vary by platform
- React Native's `expo-file-system` provides cross-platform API

**Risk**:
- Hardcoding path breaks on one platform
- Wrong directory might not have write permissions
- Database file might not persist correctly

## Decision

Use **platform-specific database paths** determined at runtime based on `Platform.OS`.

### Implementation

**1. Abstract Repository Base** (`/infra/__abstract__/prisma.repository.ts`)

```typescript
import { Platform } from 'react-native'
import * as FileSystem from 'expo-file-system'

export abstract class PrismaRepository {
  protected getDatabasePath(): string {
    const docDir = FileSystem.documentDirectory

    if (Platform.OS === 'android') {
      // Android: /data/data/<package>/files/databases/app.db
      return `${docDir}databases/app.db`
    } else {
      // iOS: ~/Documents/app.db
      return `${docDir}app.db`
    }
  }

  protected async ensureDatabaseDirectory(): Promise<void> {
    const dbPath = this.getDatabasePath()
    const dbDir = dbPath.substring(0, dbPath.lastIndexOf('/'))

    const dirInfo = await FileSystem.getInfoAsync(dbDir)
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dbDir, { intermediates: true })
    }
  }
}
```

**2. Database Service** (`/infra/database-service/prisma.database.service.ts`)

```typescript
export class PrismaDatabaseService implements IDatabaseService {
  async initialize(): Promise<void> {
    const dbPath = this.getDatabasePath()

    // Ensure directory exists
    await this.ensureDatabaseDirectory()

    // Initialize Prisma with platform-specific path
    await initializePrismaClient({
      datasources: {
        db: {
          url: `file:${dbPath}`,
        },
      },
    })

    // Run migrations
    await this.runMigrations()
  }
}
```

**3. Resulting Paths**

```typescript
// Android
file:/data/data/com.tiedsiren51/files/databases/app.db

// iOS
file:/var/mobile/Containers/Data/Application/<UUID>/Documents/app.db
```

## Consequences

### Positive

- **Cross-platform**: Works correctly on both iOS and Android
- **Conventional**: Follows platform conventions
- **Reliable**: Database persists across app restarts
- **Permissions**: Uses directories with guaranteed write access
- **Explicit**: Path construction is clear and traceable
- **Testable**: Can mock `Platform.OS` for testing
- **Centralized**: Path logic in one place (base class)
- **Directory creation**: Automatically creates directories if needed

### Negative

- **Platform coupling**: Code must check platform
- **Abstraction complexity**: Extra layer for path resolution
- **Testing**: Must test on both platforms
- **Debugging**: Different paths make debugging harder
- **Documentation**: Must document path differences

### Neutral

- **Runtime determination**: Path determined at runtime, not build time
- **expo-file-system dependency**: Relies on Expo's file system API

## Alternatives Considered

### 1. Hardcoded Single Path
**Rejected because**:
```typescript
const DB_PATH = `${FileSystem.documentDirectory}app.db`
```
- Doesn't follow Android conventions
- Might fail on Android (no `/databases/` dir)
- Not platform-aware

### 2. Build-Time Configuration
**Rejected because**:
- Requires separate builds per platform
- More complex build setup
- Expo handles this better at runtime

### 3. Environment Variables
**Rejected because**:
```typescript
const DB_PATH = process.env.DB_PATH
```
- Must set for each platform
- More configuration to maintain
- Runtime determination simpler

### 4. Same Path Both Platforms
**Rejected because**:
- Ignores platform conventions
- Android developers expect `/databases/`
- Could confuse debugging

### 5. External Storage (Android)
**Rejected because**:
- Requires additional permissions
- Less secure
- Not necessary for our use case
- Internal storage sufficient

## Implementation Notes

### Key Files
- `/infra/__abstract__/prisma.repository.ts` - Path resolution
- `/infra/database-service/prisma.database.service.ts` - Database initialization

### Path Resolution Logic

```typescript
protected getDatabasePath(): string {
  const baseDir = FileSystem.documentDirectory

  switch (Platform.OS) {
    case 'android':
      return `${baseDir}databases/app.db`
    case 'ios':
      return `${baseDir}app.db`
    case 'web':
      // Not currently supported, but could use IndexedDB
      throw new Error('Web platform not supported for SQLite')
    default:
      throw new Error(`Unsupported platform: ${Platform.OS}`)
  }
}
```

### Directory Creation

```typescript
protected async ensureDatabaseDirectory(): Promise<void> {
  const dbPath = this.getDatabasePath()
  const dbDir = dbPath.substring(0, dbPath.lastIndexOf('/'))

  try {
    const dirInfo = await FileSystem.getInfoAsync(dbDir)

    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dbDir, {
        intermediates: true, // Create parent directories if needed
      })
    }
  } catch (error) {
    throw new Error(`Failed to create database directory: ${error}`)
  }
}
```

### Testing Different Platforms

```typescript
describe('PrismaRepository', () => {
  it('uses correct path on Android', () => {
    jest.spyOn(Platform, 'OS', 'get').mockReturnValue('android')

    const repo = new TestRepository()
    const path = repo.getDatabasePath()

    expect(path).toContain('databases/app.db')
  })

  it('uses correct path on iOS', () => {
    jest.spyOn(Platform, 'OS', 'get').mockReturnValue('ios')

    const repo = new TestRepository()
    const path = repo.getDatabasePath()

    expect(path).toContain('app.db')
    expect(path).not.toContain('databases/')
  })
})
```

### Debugging Database Files

**Android (via adb)**:
```bash
adb shell run-as com.tiedsiren51
cd files/databases
ls -la
```

**iOS (via Xcode)**:
- Device: Use Xcode -> Window -> Devices and Simulators
- Simulator: `~/Library/Developer/CoreSimulator/Devices/<UUID>/data/Containers/Data/Application/<UUID>/Documents/`

### Related ADRs
- [Prisma ORM with SQLite](prisma-orm-sqlite.md)
- [Local-First Architecture](local-first-architecture.md)

## References

- [Expo File System Docs](https://docs.expo.dev/versions/latest/sdk/filesystem/)
- [iOS File System Programming Guide](https://developer.apple.com/library/archive/documentation/FileManagement/Conceptual/FileSystemProgrammingGuide/)
- [Android Data Storage](https://developer.android.com/training/data-storage)
- `/infra/__abstract__/prisma.repository.ts` - Implementation

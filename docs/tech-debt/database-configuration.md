# Database Configuration

**Priority**: 📋 **LOW**
**Effort**: Medium
**Status**: Open
**Created**: January 28, 2025

## Problem Statement

Database paths and configuration are currently hardcoded:

```typescript
// Current approach
public getDbPath() {
  return Platform.OS === 'android'
    ? `${FileSystem.documentDirectory}databases/${this.dbName}`
    : `${FileSystem.documentDirectory}${this.dbName}`
}
```

Issues:
- Hard to test with different database locations
- Can't easily support multiple environments (dev/staging/prod)
- No way to configure database name
- Difficult to implement database per-user for multi-tenancy (future)

## When This Becomes a Problem

Currently not blocking, but could cause issues when:
- Testing requires isolated databases
- Need different databases for development vs production
- Implementing advanced features like data export/import
- Supporting multiple user profiles on one device

## Proposed Solution

### 1. Configuration Object

```typescript
// infra/database-service/database-config.ts
export interface DatabaseConfig {
  name: string
  path?: string  // Optional, falls back to default
  location: 'documents' | 'cache' | 'custom'
}

export const DEFAULT_DB_CONFIG: DatabaseConfig = {
  name: 'app.db',
  location: 'documents',
}
```

### 2. Configurable Repository

```typescript
export abstract class PrismaRepository {
  constructor(private config: DatabaseConfig = DEFAULT_DB_CONFIG) {
    this.dbPath = this.getDbPath(config)
    // ...
  }

  private getDbPath(config: DatabaseConfig): string {
    if (config.path) return config.path

    const baseDir = this.getBaseDirectory(config.location)
    const dbPath = Platform.OS === 'android'
      ? `${baseDir}/databases/${config.name}`
      : `${baseDir}/${config.name}`

    return dbPath
  }

  private getBaseDirectory(location: DatabaseConfig['location']): string {
    switch (location) {
      case 'documents':
        return FileSystem.documentDirectory!
      case 'cache':
        return FileSystem.cacheDirectory!
      case 'custom':
        throw new Error('Custom path required')
    }
  }
}
```

### 3. Environment-Specific Config

```typescript
// config/database.config.ts
const DATABASE_CONFIGS = {
  development: {
    name: 'app-dev.db',
    location: 'documents',
  },
  test: {
    name: 'app-test.db',
    location: 'cache',  // Faster, disposable
  },
  production: {
    name: 'app.db',
    location: 'documents',
  },
} as const

export const getDatabaseConfig = (): DatabaseConfig => {
  const env = __DEV__ ? 'development' : 'production'
  return DATABASE_CONFIGS[env]
}
```

## Benefits

- **Testability**: Use different databases for tests
- **Flexibility**: Easy to change database location/name
- **Multi-environment**: Different configs per environment
- **Documentation**: Config object documents available options
- **Future-proof**: Ready for advanced features

## Implementation Plan

1. Create `DatabaseConfig` interface
2. Update `PrismaRepository` constructor to accept config
3. Add environment detection
4. Update dependency injection to use config
5. Document configuration options

**Estimated Effort**: 3-4 hours

## Trigger Points

Address when:
- Need to test with isolated databases
- Implementing multi-user support
- Issues arise from hardcoded paths in different environments
- Before implementing data export/import features

## Impact

**Low** - Current hardcoded approach works fine for single-user, single-environment app. Only needed when requirements change.

## Related ADRs

- [Platform-Specific Database Paths](../adr/infrastructure/platform-specific-db-paths.md)
- [Prisma ORM with SQLite](../adr/infrastructure/prisma-orm-sqlite.md)

import { PrismaClient } from '@prisma/client/react-native'
import * as FileSystem from 'expo-file-system'
import { Platform } from 'react-native'
import '@prisma/react-native'
import { Logger } from '@/core/_ports_/logger'

type ColumnInfo = { name: string; type: string }

export enum UserScopedTable {
  SIREN = 'Siren',
  BLOCKLIST = 'Blocklist',
  BLOCK_SESSION = 'BlockSession',
}

export abstract class PrismaRepository {
  // Shared across ALL PrismaRepository instances — single connection, single init
  private static _sharedClient: PrismaClient | null = null

  private static _isInitialized = false

  private static _initPromise: Promise<void> | null = null

  private static _dbPath: string | null = null

  private static _claimedUserTables = new Set<string>()

  private static readonly DB_NAME = 'app.db'

  protected baseClient!: PrismaClient

  protected abstract readonly logger: Logger

  protected constructor() {
    if (!PrismaRepository._sharedClient) {
      PrismaRepository._dbPath = this.computeDbPath()
      PrismaRepository._sharedClient = new PrismaClient({
        log: [{ emit: 'stdout', level: 'error' }],
        datasources: {
          db: {
            url: `file:${PrismaRepository._dbPath}`,
          },
        },
      })
    }
    this.baseClient = PrismaRepository._sharedClient
    // Eagerly start shared initialization (fire-and-forget) — first constructor wins.
    // Errors are swallowed here and retried by ensureInitialized() on first method call.
    this.initialize().catch(() => {})
  }

  private computeDbPath(): string {
    return Platform.OS === 'android'
      ? `${FileSystem.documentDirectory}databases/${PrismaRepository.DB_NAME}`
      : `${FileSystem.documentDirectory}${PrismaRepository.DB_NAME}`
  }

  public getDbPath(): string {
    if (!PrismaRepository._dbPath)
      PrismaRepository._dbPath = this.computeDbPath()

    return PrismaRepository._dbPath
  }

  public async initialize(): Promise<void> {
    try {
      if (PrismaRepository._isInitialized) return
      if (!PrismaRepository._initPromise)
        PrismaRepository._initPromise = this.performInitialization()

      await PrismaRepository._initPromise
    } catch (error) {
      PrismaRepository._initPromise = null
      this.logger.error(`[PrismaRepository] Failed to initialize: ${error}`)
      throw error
    }
  }

  private async performInitialization(): Promise<void> {
    try {
      await this.ensureDatabaseFile()
      await this.connectToDatabase()
      await this.createAllTables()
      await this.loadInitialData()
      PrismaRepository._isInitialized = true
    } catch (error) {
      this.logger.error(
        `[PrismaRepository] Failed to initialize database: ${error}`,
      )
      throw new Error(`Failed to initialize database: ${error}`)
    }
  }

  protected async ensureInitialized(): Promise<void> {
    try {
      await this.initialize()
    } catch (error) {
      this.logger.error(
        `[PrismaRepository] Failed to ensureInitialized: ${error}`,
      )
      throw error
    }
  }

  public getClient(): PrismaClient {
    if (!PrismaRepository._isInitialized)
      throw new Error('Database not initialized')

    return this.baseClient
  }

  private async ensureDatabaseFile(): Promise<void> {
    try {
      const dbPath = this.getDbPath()
      const fileInfo = await FileSystem.getInfoAsync(dbPath)

      if (!fileInfo.exists) {
        const dirPath = dbPath.substring(0, dbPath.lastIndexOf('/'))
        await FileSystem.makeDirectoryAsync(dirPath, { intermediates: true })

        await FileSystem.writeAsStringAsync(dbPath, '', {
          encoding: FileSystem.EncodingType.UTF8,
        })
      }
    } catch (error) {
      this.logger.error(
        `[PrismaRepository] Error ensuring database file: ${error}`,
      )
      throw error
    }
  }

  private async connectToDatabase(): Promise<void> {
    try {
      await this.baseClient.$connect()
      await this.baseClient.$queryRaw`PRAGMA busy_timeout = 5000;`
      await this.baseClient.$queryRaw`PRAGMA foreign_keys = ON;`
    } catch (error) {
      this.logger.error(
        `[PrismaRepository] Error connecting to database: ${error}`,
      )
      throw error
    }
  }

  private async createAllTables(): Promise<void> {
    try {
      await this.createMainTables()
      await this.createJunctionTables()
      await this.migrateTimerTable()
      await this.migrateUserIdColumns()
    } catch (error) {
      this.logger.error(`[PrismaRepository] Error creating tables: ${error}`)
      throw error
    }
  }

  private async createMainTables(): Promise<void> {
    await this.baseClient.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Siren" (
        "id" TEXT PRIMARY KEY NOT NULL,
        "userId" TEXT NOT NULL DEFAULT '',
        "type" TEXT NOT NULL,
        "value" TEXT NOT NULL,
        "name" TEXT,
        "icon" TEXT
      );
    `

    await this.baseClient.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Blocklist" (
        "id" TEXT PRIMARY KEY NOT NULL,
        "userId" TEXT NOT NULL DEFAULT '',
        "name" TEXT NOT NULL,
        "sirens" TEXT NOT NULL
      );
    `

    await this.baseClient.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Device" (
        "id" TEXT PRIMARY KEY NOT NULL,
        "type" TEXT NOT NULL,
        "name" TEXT NOT NULL
      );
    `

    await this.baseClient.$executeRaw`
      CREATE TABLE IF NOT EXISTS "BlockSession" (
        "id" TEXT PRIMARY KEY NOT NULL,
        "userId" TEXT NOT NULL DEFAULT '',
        "name" TEXT NOT NULL,
        "startedAt" TEXT NOT NULL,
        "endedAt" TEXT NOT NULL,
        "startNotificationId" TEXT NOT NULL,
        "endNotificationId" TEXT NOT NULL,
        "blockingConditions" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `

    await this.baseClient.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Timer" (
        "id" TEXT PRIMARY KEY NOT NULL,
        "userId" TEXT NOT NULL,
        "endedAt" TEXT NOT NULL,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `
  }

  private async migrateTimerTable(): Promise<void> {
    try {
      const tableInfo = await this.baseClient.$queryRaw<ColumnInfo[]>`
        PRAGMA table_info("Timer");
      `

      const hasUserIdColumn = tableInfo.some((col) => col.name === 'userId')
      const hasEndAtColumn = tableInfo.some((col) => col.name === 'endAt')
      const hasEndedAtColumn = tableInfo.some((col) => col.name === 'endedAt')

      if (!hasUserIdColumn) {
        await this.baseClient.$executeRaw`
          ALTER TABLE "Timer" ADD COLUMN "userId" TEXT;
        `

        await this.baseClient.$executeRaw`
          UPDATE "Timer" SET "userId" = "id" WHERE "userId" IS NULL;
        `
      }

      // Migration: Rename endAt to endedAt if needed
      if (hasEndAtColumn && !hasEndedAtColumn) {
        await this.baseClient.$executeRaw`
          ALTER TABLE "Timer" RENAME COLUMN "endAt" TO "endedAt";
        `
        this.logger.info(
          '[PrismaRepository] Migrated Timer table: renamed endAt to endedAt',
        )
      }
    } catch (error) {
      this.logger.error(
        `[PrismaRepository] Error migrating Timer table: ${error}`,
      )
      throw error
    }
  }

  private async migrateUserIdColumns(): Promise<void> {
    try {
      const { SIREN, BLOCKLIST, BLOCK_SESSION } = UserScopedTable
      await this.addUserIdColumnIfMissing(SIREN)
      await this.addUserIdColumnIfMissing(BLOCKLIST)
      await this.addUserIdColumnIfMissing(BLOCK_SESSION)
    } catch (error) {
      this.logger.error(
        `[PrismaRepository] Error migrating userId columns: ${error}`,
      )
      throw error
    }
  }

  // Uses $queryRawUnsafe because SQLite PRAGMAs don't support bound parameters.
  // Safe: tableName is restricted to UserScopedTable enum values.
  // Handles concurrent calls: another repo instance may add the column first
  // (duplicate column error is swallowed via .catch).
  private async addUserIdColumnIfMissing(
    tableName: UserScopedTable,
  ): Promise<void> {
    const tableInfo = await this.baseClient.$queryRawUnsafe<ColumnInfo[]>(
      `PRAGMA table_info("${tableName}");`,
    )

    const hasUserIdColumn = tableInfo.some((col) => col.name === 'userId')

    if (!hasUserIdColumn) {
      await this.baseClient
        .$executeRawUnsafe(
          `ALTER TABLE "${tableName}" ADD COLUMN "userId" TEXT NOT NULL DEFAULT ''`,
        )
        .catch((error: unknown) => {
          // Another repo instance may have added the column concurrently
          if (!String(error).includes('duplicate column')) throw error
        })

      this.logger.info(
        `[PrismaRepository] Migrated ${tableName} table: added userId column`,
      )
    }
  }

  // Idempotent: UPDATE WHERE userId = '' is a no-op if rows were already claimed.
  // Shared across all instances so the claim check is consistent.
  // WARNING: The first user to read a table claims ALL orphaned rows (userId = '').
  // On a shared device, rows created while logged out go to whoever signs in first.
  protected async claimOrphanedRows(
    userId: string,
    tableName: UserScopedTable,
  ): Promise<void> {
    try {
      const key = `${tableName}:${userId}`
      if (PrismaRepository._claimedUserTables.has(key)) return

      await this.ensureInitialized()
      await this.baseClient.$executeRawUnsafe(
        `UPDATE "${tableName}" SET "userId" = ? WHERE "userId" = ''`,
        userId,
      )
      PrismaRepository._claimedUserTables.add(key)
    } catch (error) {
      this.logger.error(
        `[PrismaRepository] Failed to claimOrphanedRows: ${error}`,
      )
      throw error
    }
  }

  private async createJunctionTables(): Promise<void> {
    await this.baseClient.$executeRaw`
      CREATE TABLE IF NOT EXISTS "_BlockSessionToBlocklist" (
        "A" TEXT NOT NULL,
        "B" TEXT NOT NULL,
        FOREIGN KEY ("A") REFERENCES "BlockSession"("id") ON DELETE CASCADE,
        FOREIGN KEY ("B") REFERENCES "Blocklist"("id") ON DELETE CASCADE
      );
    `
    await this.baseClient.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "_BlockSessionToBlocklist_AB_unique"
        ON "_BlockSessionToBlocklist"("A", "B");
    `
    await this.baseClient.$executeRaw`
      CREATE INDEX IF NOT EXISTS "_BlockSessionToBlocklist_B_index"
        ON "_BlockSessionToBlocklist"("B");
    `

    await this.baseClient.$executeRaw`
      CREATE TABLE IF NOT EXISTS "_BlockSessionToDevice" (
        "A" TEXT NOT NULL,
        "B" TEXT NOT NULL,
        FOREIGN KEY ("A") REFERENCES "BlockSession"("id") ON DELETE CASCADE,
        FOREIGN KEY ("B") REFERENCES "Device"("id") ON DELETE CASCADE
      );
    `
    await this.baseClient.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "_BlockSessionToDevice_AB_unique"
        ON "_BlockSessionToDevice"("A", "B");
    `
    await this.baseClient.$executeRaw`
      CREATE INDEX IF NOT EXISTS "_BlockSessionToDevice_B_index"
        ON "_BlockSessionToDevice"("B");
    `
  }

  private async loadInitialData(): Promise<void> {
    try {
      await this.baseClient.siren.findMany()
      await this.baseClient.blocklist.findMany()
    } catch (error) {
      this.logger.error(
        `[PrismaRepository] Error loading initial data: ${error}`,
      )
      throw error
    }
  }
}

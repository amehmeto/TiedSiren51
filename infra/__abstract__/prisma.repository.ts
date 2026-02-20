import { PrismaClient } from '@prisma/client/react-native'
import * as FileSystem from 'expo-file-system'
import { Platform } from 'react-native'
import '@prisma/react-native'
import { Logger } from '@/core/_ports_/logger'

type ColumnInfo = { name: string; type: string }

export abstract class PrismaRepository {
  private _isInitialized = false

  private _initPromise: Promise<void> | null = null

  private readonly dbName = 'app.db'

  private readonly dbPath: string

  protected baseClient: PrismaClient

  protected abstract readonly logger: Logger

  protected constructor() {
    this.dbPath = this.getDbPath()
    this.baseClient = this.getPrismaClient()
    this._initPromise = this.initialize()
  }

  private getPrismaClient() {
    return new PrismaClient({
      log: [{ emit: 'stdout', level: 'error' }],
      datasources: {
        db: {
          url: `file:${this.dbPath}`,
        },
      },
    })
  }

  public getDbPath() {
    return Platform.OS === 'android'
      ? `${FileSystem.documentDirectory}databases/${this.dbName}`
      : `${FileSystem.documentDirectory}${this.dbName}`
  }

  public async initialize(): Promise<void> {
    try {
      if (this._isInitialized) return

      await this.ensureDatabaseFile()
      await this.connectToDatabase()
      await this.createAllTables()
      await this.loadInitialData()
      this._isInitialized = true
    } catch (error) {
      this.logger.error(
        `[PrismaRepository] Failed to initialize database: ${error}`,
      )
      throw new Error(`Failed to initialize database: ${error}`)
    }
  }

  protected async ensureInitialized(): Promise<void> {
    try {
      if (this._isInitialized) return
      if (this._initPromise) await this._initPromise
    } catch (error) {
      this.logger.error(
        `[PrismaRepository] Failed to ensureInitialized: ${error}`,
      )
      throw error
    }
  }

  public getClient(): PrismaClient {
    if (!this._isInitialized) throw new Error('Database not initialized')

    return this.baseClient
  }

  private async ensureDatabaseFile(): Promise<void> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(this.dbPath)

      if (!fileInfo.exists) {
        const dirPath = this.dbPath.substring(0, this.dbPath.lastIndexOf('/'))
        await FileSystem.makeDirectoryAsync(dirPath, { intermediates: true })

        await FileSystem.writeAsStringAsync(this.dbPath, '', {
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
      await this.baseClient.$executeRaw`PRAGMA foreign_keys = ON;`
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
      await this.addUserIdColumnIfMissing('Siren')
      await this.addUserIdColumnIfMissing('Blocklist')
      await this.addUserIdColumnIfMissing('BlockSession')
    } catch (error) {
      this.logger.error(
        `[PrismaRepository] Error migrating userId columns: ${error}`,
      )
      throw error
    }
  }

  // Uses $queryRawUnsafe because SQLite PRAGMAs don't support bound parameters.
  // Safe: tableName is always a hardcoded internal string ('Siren', 'Blocklist', 'BlockSession').
  private async addUserIdColumnIfMissing(tableName: string): Promise<void> {
    const tableInfo = await this.baseClient.$queryRawUnsafe<ColumnInfo[]>(
      `PRAGMA table_info("${tableName}");`,
    )

    const hasUserIdColumn = tableInfo.some((col) => col.name === 'userId')

    if (!hasUserIdColumn) {
      await this.baseClient.$executeRawUnsafe(
        `ALTER TABLE "${tableName}" ADD COLUMN "userId" TEXT NOT NULL DEFAULT ''`,
      )

      this.logger.info(
        `[PrismaRepository] Migrated ${tableName} table: added userId column`,
      )
    }
  }

  private claimedUserTables = new Set<string>()

  // Idempotent: UPDATE WHERE userId = '' is a no-op if rows were already claimed.
  // Safe under concurrent calls — each repo instance has its own claimedUserTables
  // Set, and the SQL itself is harmless to run multiple times.
  // WARNING: The first user to read a table claims ALL orphaned rows (userId = '').
  // On a shared device, rows created while logged out go to whoever signs in first.
  protected async claimOrphanedRows(
    userId: string,
    tableName: string,
  ): Promise<void> {
    try {
      const key = `${tableName}:${userId}`
      if (this.claimedUserTables.has(key)) return

      await this.ensureInitialized()
      await this.baseClient.$executeRawUnsafe(
        `UPDATE "${tableName}" SET "userId" = ? WHERE "userId" = ''`,
        userId,
      )
      this.claimedUserTables.add(key)
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
      CREATE TABLE IF NOT EXISTS "_BlockSessionToDevice" (
        "A" TEXT NOT NULL,
        "B" TEXT NOT NULL,
        FOREIGN KEY ("A") REFERENCES "BlockSession"("id") ON DELETE CASCADE,
        FOREIGN KEY ("B") REFERENCES "Device"("id") ON DELETE CASCADE
      );
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

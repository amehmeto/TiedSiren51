import { PrismaClient } from '@prisma/client/react-native'
import * as FileSystem from 'expo-file-system'
import { Platform } from 'react-native'
import '@prisma/react-native'
import { Logger } from '@/core/_ports_/logger'

// Singleton state for shared PrismaClient
let sharedClient: PrismaClient | null = null
let sharedInitPromise: Promise<void> | null = null
let isSharedInitialized = false

function getDbPath(): string {
  const dbName = 'app.db'
  return Platform.OS === 'android'
    ? `${FileSystem.documentDirectory}databases/${dbName}`
    : `${FileSystem.documentDirectory}${dbName}`
}

function getOrCreateSharedClient(): PrismaClient {
  if (!sharedClient) {
    const dbPath = getDbPath()
    sharedClient = new PrismaClient({
      log: [{ emit: 'stdout', level: 'error' }],
      datasources: {
        db: {
          url: `file:${dbPath}`,
        },
      },
    })
  }
  return sharedClient
}

export abstract class PrismaRepository {
  protected baseClient: PrismaClient

  protected abstract readonly logger: Logger

  protected constructor() {
    this.baseClient = getOrCreateSharedClient()
  }

  public getDbPath(): string {
    return getDbPath()
  }

  public async initialize(): Promise<void> {
    // If already initialized, return immediately
    if (isSharedInitialized) return

    // If initialization is in progress, wait for it
    if (sharedInitPromise) {
      await sharedInitPromise
      return
    }

    // Start initialization and store the promise
    sharedInitPromise = this.doInitialize()
    try {
      await sharedInitPromise
      isSharedInitialized = true
    } catch (error) {
      sharedInitPromise = null
      throw error
    }
  }

  private async doInitialize(): Promise<void> {
    try {
      await this.ensureDatabaseFile()
      await this.connectToDatabase()
      await this.createAllTables()
      await this.loadInitialData()
    } catch (error) {
      throw new Error(`Failed to initialize database: ${error}`)
    }
  }

  public getClient(): PrismaClient {
    if (!isSharedInitialized) throw new Error('Database not initialized')

    return this.baseClient
  }

  private async ensureDatabaseFile(): Promise<void> {
    const dbPath = getDbPath()
    try {
      const fileInfo = await FileSystem.getInfoAsync(dbPath)

      if (!fileInfo.exists) {
        const dirPath = dbPath.substring(0, dbPath.lastIndexOf('/'))
        await FileSystem.makeDirectoryAsync(dirPath, { intermediates: true })

        await FileSystem.writeAsStringAsync(dbPath, '', {
          encoding: FileSystem.EncodingType.UTF8,
        })
      }
    } catch (error) {
      this.logger.error(`Error ensuring database file: ${error}`)
      throw error
    }
  }

  private async connectToDatabase(): Promise<void> {
    try {
      await this.baseClient.$connect()
      await this.baseClient.$executeRaw`PRAGMA foreign_keys = ON;`
    } catch (error) {
      this.logger.error(`Error connecting to database: ${error}`)
      throw error
    }
  }

  private async createAllTables(): Promise<void> {
    try {
      await this.createMainTables()
      await this.createJunctionTables()
      await this.migrateTimerTable()
    } catch (error) {
      this.logger.error(`Error creating tables: ${error}`)
      throw error
    }
  }

  private async createMainTables(): Promise<void> {
    await this.baseClient.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Siren" (
        "id" TEXT PRIMARY KEY NOT NULL,
        "type" TEXT NOT NULL,
        "value" TEXT NOT NULL,
        "name" TEXT,
        "icon" TEXT
      );
    `

    await this.baseClient.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Blocklist" (
        "id" TEXT PRIMARY KEY NOT NULL,
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
      const tableInfo = await this.baseClient.$queryRaw<
        { name: string; type: string }[]
      >`
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
        this.logger.info('Migrated Timer table: renamed endAt to endedAt')
      }
    } catch (error) {
      this.logger.error(`Error migrating Timer table: ${error}`)
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
      this.logger.error(`Error loading initial data: ${error}`)
    }
  }
}

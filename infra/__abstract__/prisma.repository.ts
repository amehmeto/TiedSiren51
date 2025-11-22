import { PrismaClient } from '@prisma/client/react-native'
import * as FileSystem from 'expo-file-system'
import { Platform } from 'react-native'
import '@prisma/react-native'

export abstract class PrismaRepository {
  private _isInitialized = false

  private readonly dbName = 'app.db'

  private readonly dbPath: string

  protected baseClient: PrismaClient

  public constructor() {
    this.dbPath = this.getDbPath()
    this.baseClient = this.getPrismaClient()
    this.initialize()
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
    if (this._isInitialized) return

    try {
      await this.ensureDatabaseFile()
      await this.connectToDatabase()
      await this.createAllTables()
      await this.loadInitialData()
      this._isInitialized = true
    } catch (error) {
      throw new Error(`Failed to initialize database: ${error}`)
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
      // eslint-disable-next-line no-console
      console.error('Error ensuring database file:', error)
      throw error
    }
  }

  private async connectToDatabase(): Promise<void> {
    try {
      await this.baseClient.$connect()
      await this.baseClient.$executeRaw`PRAGMA foreign_keys = ON;`
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error connecting to database:', error)
      throw error
    }
  }

  private async createAllTables(): Promise<void> {
    try {
      await this.createMainTables()
      await this.createJunctionTables()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error creating tables:', error)
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
      // eslint-disable-next-line no-console
      console.error('Error loading initial data:', error)
    }
  }
}

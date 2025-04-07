import { PrismaClient } from '@prisma/client/react-native'
import * as FileSystem from 'expo-file-system'
import { Platform } from 'react-native'

export abstract class PrismaRepository {
  private _isInitialized = false
  private readonly dbName = 'app.db'
  private readonly dbPath: string
  public readonly baseClient: PrismaClient

  public constructor() {
    this.dbPath = `${FileSystem.documentDirectory}${this.dbName}`

    this.baseClient = new PrismaClient({
      log: [
        { emit: 'stdout', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
      datasources: {
        db: {
          url: `file:${this.dbPath}`,
        },
      },
    })
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
      // eslint-disable-next-line no-console
      console.error('Database initialization error:', error)
      throw new Error(`Failed to initialize database: ${error}`)
    }
  }

  public getClient(): PrismaClient {
    if (!this._isInitialized) {
      throw new Error('Database not initialized')
    }
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

      if (Platform.OS === 'android') {
        const result =
          await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync()
        if (!result.granted) {
          throw new Error('Storage permission not granted')
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error ensuring database file:', error)
      throw error
    }
  }

  private async connectToDatabase(): Promise<void> {
    await this.baseClient.$connect()
    await this.baseClient.$executeRaw`PRAGMA foreign_keys = ON;`
  }

  private async createAllTables(): Promise<void> {
    await this.createMainTables()
    await this.createJunctionTables()
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
    await this.baseClient.siren.findMany()
    await this.baseClient.blocklist.findMany()
  }
}

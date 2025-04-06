import { PrismaClient } from '@prisma/client/react-native'
import { reactiveHooksExtension } from '@prisma/react-native'
import * as FileSystem from 'expo-file-system'
import { Platform } from 'react-native'
import { AppStorage } from '@/core/ports/app-storage'

const DB_NAME = 'app.db'
const DB_PATH = `${FileSystem.documentDirectory}${DB_NAME}`

// Define a more generic type that includes both the PrismaClient
// and the additional methods from reactiveHooksExtension
type ExtendedPrismaClient = Omit<PrismaClient, '$extends'> & {
  $refreshSubscriptions: () => Promise<void>
}

export class PrismaAppStorage implements AppStorage {
  private static _instance: PrismaAppStorage
  private _isInitialized = false
  private baseClient: PrismaClient
  private extendedClient: ExtendedPrismaClient

  private constructor() {
    this.baseClient = new PrismaClient({
      log: [
        { emit: 'stdout', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
      datasources: {
        db: {
          url: `file:${DB_PATH}`,
        },
      },
    })
    this.extendedClient = this.baseClient.$extends(
      reactiveHooksExtension(),
    ) as unknown as ExtendedPrismaClient
  }

  public static getInstance(): PrismaAppStorage {
    if (!PrismaAppStorage._instance) {
      PrismaAppStorage._instance = new PrismaAppStorage()
    }
    return PrismaAppStorage._instance
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

  public isInitialized(): boolean {
    return this._isInitialized
  }

  public async disconnect(): Promise<void> {
    if (!this._isInitialized) return
    await this.baseClient.$disconnect()
    this._isInitialized = false
  }

  public async refresh(): Promise<void> {
    if (!this._isInitialized) return
    await this.extendedClient.$refreshSubscriptions()
  }

  public getClient(): PrismaClient {
    if (!this._isInitialized) {
      throw new Error('Database not initialized')
    }
    return this.baseClient
  }

  public getExtendedClient(): ExtendedPrismaClient {
    if (!this._isInitialized) {
      throw new Error('Database not initialized')
    }
    return this.extendedClient
  }

  private async ensureDatabaseFile(): Promise<void> {
    const fileInfo = await FileSystem.getInfoAsync(DB_PATH)

    if (fileInfo.exists) {
      return
    }

    await FileSystem.writeAsStringAsync(DB_PATH, '', {
      encoding: FileSystem.EncodingType.UTF8,
    })

    if (!FileSystem.documentDirectory) {
      throw new Error('Document directory is not available')
    }

    await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory, {
      intermediates: true,
    })

    if (Platform.OS === 'ios') {
      await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(
        FileSystem.documentDirectory,
      )
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
    await this.extendedClient.$refreshSubscriptions()
  }

  public async getDatabaseInfo(): Promise<any> {
    const [count, lists, tableInfo] = await Promise.all([
      this.baseClient.blocklist.count(),
      this.baseClient.blocklist.findMany(),
      this.baseClient.$executeRaw`PRAGMA table_info(Blocklist);`,
    ])

    return {
      blocklistCount: count,
      blocklists: count > 0 ? lists : [],
      tableStructure: tableInfo,
    }
  }
}

export const appStorage = PrismaAppStorage.getInstance()

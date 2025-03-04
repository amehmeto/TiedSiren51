import { PrismaClient } from '@prisma/client/react-native'
import { reactiveHooksExtension } from '@prisma/react-native'
import * as FileSystem from 'expo-file-system'
import { Platform } from 'react-native'

const DB_NAME = 'app.db'
const DB_PATH = `${FileSystem.documentDirectory}${DB_NAME}`

export const baseClient = new PrismaClient({
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

export const extendedClient = baseClient.$extends(reactiveHooksExtension())

export async function initializeDb() {
  await ensureDatabaseFile()
  await connectToDatabase()
  await createAllTables()
  await loadInitialData()
}

async function ensureDatabaseFile() {
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

async function connectToDatabase() {
  await baseClient.$connect()
  await baseClient.$executeRaw`PRAGMA foreign_keys = ON;`
}

async function createAllTables() {
  await createMainTables()
  await createJunctionTables()
}

async function createMainTables() {
  await baseClient.$executeRaw`
    CREATE TABLE IF NOT EXISTS "Siren" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "type" TEXT NOT NULL,
      "value" TEXT NOT NULL,
      "name" TEXT,
      "icon" TEXT
    );
  `

  await baseClient.$executeRaw`
    CREATE TABLE IF NOT EXISTS "Blocklist" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "name" TEXT NOT NULL,
      "sirens" TEXT NOT NULL
    );
  `

  await baseClient.$executeRaw`
    CREATE TABLE IF NOT EXISTS "Device" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "type" TEXT NOT NULL,
      "name" TEXT NOT NULL
    );
  `

  await baseClient.$executeRaw`
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

async function createJunctionTables() {
  await baseClient.$executeRaw`
    CREATE TABLE IF NOT EXISTS "_BlockSessionToBlocklist" (
      "A" TEXT NOT NULL,
      "B" TEXT NOT NULL,
      FOREIGN KEY ("A") REFERENCES "BlockSession"("id") ON DELETE CASCADE,
      FOREIGN KEY ("B") REFERENCES "Blocklist"("id") ON DELETE CASCADE
    );
  `

  await baseClient.$executeRaw`
    CREATE TABLE IF NOT EXISTS "_BlockSessionToDevice" (
      "A" TEXT NOT NULL,
      "B" TEXT NOT NULL,
      FOREIGN KEY ("A") REFERENCES "BlockSession"("id") ON DELETE CASCADE,
      FOREIGN KEY ("B") REFERENCES "Device"("id") ON DELETE CASCADE
    );
  `
}

async function loadInitialData() {
  await baseClient.siren.findMany()

  await baseClient.blocklist.findMany()

  await extendedClient.$refreshSubscriptions()
}

export async function closeDb() {
  await baseClient.$disconnect()
}

export async function getDatabaseInfo() {
  const [count, lists, tableInfo] = await Promise.all([
    baseClient.blocklist.count(),
    baseClient.blocklist.findMany(),
    baseClient.$executeRaw`PRAGMA table_info(Blocklist);`,
  ])

  return {
    blocklistCount: count,
    blocklists: count > 0 ? lists : [],
    tableStructure: tableInfo,
  }
}

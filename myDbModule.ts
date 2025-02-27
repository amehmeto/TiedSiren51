/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client/react-native'
import { reactiveHooksExtension } from '@prisma/react-native'
import * as FileSystem from 'expo-file-system'
import { Platform } from 'react-native'

const DB_NAME = 'app.db'
const DB_PATH = `${FileSystem.documentDirectory}${DB_NAME}`

// Initialize Prisma client with logging and database configuration
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

// Add reactive hooks extension for React Native
export const extendedClient = baseClient.$extends(reactiveHooksExtension())

// Initialize database and create tables
export async function initializeDb() {
  try {
    await ensureDatabaseFile()
    await connectToDatabase()
    await createTables()
    await loadInitialData()
    console.log('Database initialization complete')
  } catch (error) {
    console.error('Database initialization failed:', error)
    throw error
  }
}

// Ensure database file exists
async function ensureDatabaseFile() {
  const fileInfo = await FileSystem.getInfoAsync(DB_PATH)
  console.log('Database path:', DB_PATH)

  if (!fileInfo.exists) {
    console.log('Creating new database file...')
    // Create an empty file with write permissions
    await FileSystem.writeAsStringAsync(DB_PATH, '', {
      encoding: FileSystem.EncodingType.UTF8,
    })

    // Ensure write permissions (iOS specific)
    await FileSystem.makeDirectoryAsync(
      FileSystem.documentDirectory as string,
      {
        intermediates: true,
      },
    ).catch((err) => console.log('Directory already exists'))

    // Set file permissions
    if (Platform.OS === 'ios') {
      await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(
        FileSystem.documentDirectory,
      ).catch((err) => console.error('Error requesting permissions:', err))
    }
  } else {
    console.log('Database file exists')
  }
}

// Connect to database and enable foreign keys
async function connectToDatabase() {
  await baseClient.$connect()
  console.log('Connected to database')
  await baseClient.$executeRaw`PRAGMA foreign_keys = ON;`
}

// Create all necessary tables
async function createTables() {
  try {
    await baseClient.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Siren" (
        "id" TEXT PRIMARY KEY NOT NULL,
        "type" TEXT NOT NULL,
        "value" TEXT NOT NULL,
        "name" TEXT,
        "icon" TEXT
      );
    `
    console.log('Siren table created/verified')

    await baseClient.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Blocklist" (
        "id" TEXT PRIMARY KEY NOT NULL,
        "name" TEXT NOT NULL,
        "sirens" TEXT NOT NULL
      );
    `
    console.log('Blocklist table created/verified')

    await baseClient.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Device" (
        "id" TEXT PRIMARY KEY NOT NULL,
        "type" TEXT NOT NULL,
        "name" TEXT NOT NULL
      );
    `
    console.log('Device table created/verified')

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
    console.log('BlockSession table created/verified')

    await createJunctionTables()
  } catch (tableError) {
    console.error('Error creating/verifying tables:', tableError)
    throw tableError
  }
}

// Create junction tables with CASCADE delete
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
  console.log('Junction tables created/verified')
}

// Load and verify initial data
async function loadInitialData() {
  try {
    // Verify Sirens
    const sirens = await baseClient.siren.findMany()
    console.log('Loaded sirens:', sirens.length)

    // Existing blocklist verification
    const lists = await baseClient.blocklist.findMany()
    console.log(
      'Loaded blocklists:',
      lists.map((list) => ({
        id: list.id,
        name: list.name,
        sirensCount: JSON.parse(list.sirens || '[]').length,
      })),
    )

    const count = await baseClient.blocklist.count()
    console.log('Initial blocklist count:', count)

    await extendedClient.$refreshSubscriptions()
  } catch (error) {
    console.error('Error loading initial data:', error)
    throw error
  }
}

// Close database connection
export async function closeDb() {
  try {
    await baseClient.$disconnect()
    console.log('Database connection closed')
  } catch (error) {
    console.error('Error closing database:', error)
  }
}

// Debug function for database inspection
export async function debugDatabase() {
  try {
    const count = await baseClient.blocklist.count()
    console.log('Current blocklist count:', count)

    if (count > 0) {
      const lists = await baseClient.blocklist.findMany()
      console.log('Existing blocklists:', lists)
      console.log(
        'Parsed blocklists:',
        lists.map((list) => ({
          id: list.id,
          name: list.name,
          sirens: JSON.parse(list.sirens || '[]'),
        })),
      )
    }

    const tableInfo = await baseClient.$executeRaw`
      PRAGMA table_info(Blocklist);
    `
    console.log('Table structure:', tableInfo)
  } catch (error) {
    console.error('Debug check failed:', error)
  }
}

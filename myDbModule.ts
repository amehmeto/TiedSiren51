/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client/react-native'
import { reactiveHooksExtension } from '@prisma/react-native'
import * as FileSystem from 'expo-file-system'

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
  try {
    // First check if database file exists
    const fileInfo = await FileSystem.getInfoAsync(DB_PATH)
    console.log('Database path:', DB_PATH)

    if (!fileInfo.exists) {
      console.log('Creating new database file...')
      await FileSystem.writeAsStringAsync(DB_PATH, '')
    } else {
      console.log('Database file exists')
    }

    // Connect to database
    await baseClient.$connect()
    console.log('Connected to database')

    try {
      // Create Blocklist table
      await baseClient.$executeRaw`
        CREATE TABLE IF NOT EXISTS "Blocklist" (
          "id" TEXT PRIMARY KEY NOT NULL,
          "name" TEXT NOT NULL,
          "sirens" TEXT NOT NULL
        );
      `
      console.log('Blocklist table created/verified')

      // Load existing data
      const lists = await baseClient.blocklist.findMany()
      console.log(
        'Loaded blocklists:',
        lists.map((list) => ({
          id: list.id,
          name: list.name,
          sirensCount: JSON.parse(list.sirens || '[]').length,
        })),
      )

      // Verify table structure
      const count = await baseClient.blocklist.count()
      console.log('Initial blocklist count:', count)

      // Trigger initial subscription refresh
      await extendedClient.$refreshSubscriptions()
    } catch (tableError) {
      console.error('Error creating/verifying table:', tableError)
      throw tableError
    }

    console.log('Database initialization complete')
  } catch (error) {
    console.error('Database initialization failed:', error)
    throw error
  }
}

export async function closeDb() {
  try {
    await baseClient.$disconnect()
    console.log('Database connection closed')
  } catch (error) {
    console.error('Error closing database:', error)
  }
}

// Add debug function with more details
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

    // Check table structure
    const tableInfo = await baseClient.$executeRaw`
      PRAGMA table_info(Blocklist);
    `
    console.log('Table structure:', tableInfo)
  } catch (error) {
    console.error('Debug check failed:', error)
  }
}

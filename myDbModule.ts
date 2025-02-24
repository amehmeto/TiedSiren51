/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client/react-native'
import { reactiveHooksExtension } from '@prisma/react-native'

export const baseClient = new PrismaClient({
  log: [
    // { emit: "stdout", level: "query" },
    { emit: 'stdout', level: 'info' },
    { emit: 'stdout', level: 'warn' },
    { emit: 'stdout', level: 'error' },
  ],
})

export const extendedClient = baseClient.$extends(reactiveHooksExtension())

export async function initializeDb() {
  try {
    await baseClient.$connect()
    console.log('Connected to database')

    // Check if table exists
    try {
      await baseClient.blocklist.count()
    } catch (e) {
      console.log('Creating database schema...')
      await baseClient.$executeRaw`
        CREATE TABLE IF NOT EXISTS Blocklist (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          sirens TEXT NOT NULL
        );
      `
    }

    console.log('Database ready')
  } catch (e) {
    console.error(`Database initialization failed:`, e)
    throw new Error('Database initialization failed')
  }
}

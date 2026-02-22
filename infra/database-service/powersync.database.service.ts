import { AbstractPowerSyncDatabase } from '@powersync/common'
import { OPSqliteOpenFactory } from '@powersync/op-sqlite'
import { PowerSyncDatabase } from '@powersync/react-native'
import { DatabaseService } from '@/core/_ports_/database.service'
import { Logger } from '@/core/_ports_/logger'
import { PowersyncLegacyMigration } from './powersync.legacy-migration'
import { powersyncSchema } from './powersync.schema'

export class PowerSyncDatabaseService implements DatabaseService {
  private readonly logger: Logger

  private readonly db: AbstractPowerSyncDatabase

  private readonly dbFilename = 'powersync.db'

  constructor(logger: Logger) {
    this.logger = logger

    const factory = new OPSqliteOpenFactory({
      dbFilename: this.dbFilename,
    })

    this.db = new PowerSyncDatabase({
      database: factory,
      schema: powersyncSchema,
    })
  }

  getDbPath(): string {
    return this.dbFilename
  }

  async initialize(): Promise<void> {
    try {
      const migration = new PowersyncLegacyMigration(this.db, this.logger)
      await migration.migrate()

      this.logger.info(
        '[PowerSyncDatabaseService] Database initialized successfully',
      )
    } catch (error) {
      this.logger.error(
        `[PowerSyncDatabaseService] Failed to initialize: ${error}`,
      )
      throw error
    }
  }

  getDatabase(): AbstractPowerSyncDatabase {
    return this.db
  }

  async claimOrphanedRows(userId: string): Promise<void> {
    try {
      const tables = ['siren', 'blocklist', 'block_session', 'device', 'timer']
      await this.db.writeTransaction(async (tx) => {
        for (const table of tables) {
          await tx.execute(
            `UPDATE ${table} SET user_id = ? WHERE user_id IS NULL`,
            [userId],
          )
        }
      })
      this.logger.info(
        `[PowerSyncDatabaseService] Claimed orphaned rows for user ${userId}`,
      )
    } catch (error) {
      this.logger.error(
        `[PowerSyncDatabaseService] Failed to claimOrphanedRows: ${error}`,
      )
      throw error
    }
  }
}

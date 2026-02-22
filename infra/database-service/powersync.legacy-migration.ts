import { open } from '@op-engineering/op-sqlite'
import { AbstractPowerSyncDatabase, Transaction } from '@powersync/common'
import * as FileSystem from 'expo-file-system'
import { Platform } from 'react-native'
import { Logger } from '@/core/_ports_/logger'

type LegacyRow = Record<string, string | number | null>
type LegacyDb = ReturnType<typeof open>

export class PowersyncLegacyMigration {
  private static readonly MIGRATION_FLAG_KEY = 'prisma_migration_completed'

  private readonly logger: Logger

  private readonly powersyncDb: AbstractPowerSyncDatabase

  constructor(powersyncDb: AbstractPowerSyncDatabase, logger: Logger) {
    this.powersyncDb = powersyncDb
    this.logger = logger
  }

  async migrate(): Promise<void> {
    try {
      const wasAlreadyMigrated = await this.checkMigrationFlag()
      if (wasAlreadyMigrated) return

      await this.performMigration()
    } catch (error) {
      this.logger.error(
        `[PowersyncLegacyMigration] Failed to migrate: ${error}`,
      )
      throw error
    }
  }

  private async checkMigrationFlag(): Promise<boolean> {
    const flag = await this.powersyncDb.getOptional<{ id: string }>(
      'SELECT id FROM ps_kv WHERE key = ?',
      [PowersyncLegacyMigration.MIGRATION_FLAG_KEY],
    )

    return flag !== null
  }

  private async performMigration(): Promise<void> {
    const legacyDbPath = this.getLegacyDbPath()
    const fileInfo = await FileSystem.getInfoAsync(legacyDbPath)

    if (!fileInfo.exists) {
      this.logger.info(
        '[PowersyncLegacyMigration] No legacy database found, skipping migration',
      )
      await this.powersyncDb.execute(
        'INSERT OR REPLACE INTO ps_kv (key, value) VALUES (?, ?)',
        [PowersyncLegacyMigration.MIGRATION_FLAG_KEY, 'true'],
      )
      return
    }

    this.logger.info(
      '[PowersyncLegacyMigration] Legacy database found, starting migration',
    )

    const legacyDb = open({
      name: 'app.db',
      location: this.getLegacyDbLocation(),
    })

    await this.migrateAllTables(legacyDb)

    legacyDb.close()

    await FileSystem.moveAsync({
      from: legacyDbPath,
      to: `${legacyDbPath}.migrated`,
    })

    this.logger.info(
      '[PowersyncLegacyMigration] Migration completed successfully',
    )
  }

  private async migrateAllTables(legacyDb: LegacyDb): Promise<void> {
    await this.powersyncDb.writeTransaction(async (tx) => {
      await this.migrateSirens(tx, legacyDb)
      await this.migrateBlocklists(tx, legacyDb)
      await this.migrateDevices(tx, legacyDb)
      await this.migrateBlockSessions(tx, legacyDb)
      await this.migrateTimers(tx, legacyDb)
      await this.migrateBlocklistJunctions(tx, legacyDb)
      await this.migrateDeviceJunctions(tx, legacyDb)
      await this.markMigrationComplete(tx)
    })
  }

  private async migrateSirens(
    tx: Transaction,
    legacyDb: LegacyDb,
  ): Promise<void> {
    const rows = await this.queryLegacy(legacyDb, 'SELECT * FROM "Siren"')
    this.logger.info(
      `[PowersyncLegacyMigration] Migrating ${rows.length} sirens`,
    )

    for (const row of rows) {
      const { id, type, value, name, icon } = row
      await tx.execute(
        'INSERT OR IGNORE INTO siren (id, type, value, name, icon) VALUES (?, ?, ?, ?, ?)',
        [id, type, value, name ?? '', icon ?? ''],
      )
    }
  }

  private async migrateBlocklists(
    tx: Transaction,
    legacyDb: LegacyDb,
  ): Promise<void> {
    const rows = await this.queryLegacy(legacyDb, 'SELECT * FROM "Blocklist"')
    this.logger.info(
      `[PowersyncLegacyMigration] Migrating ${rows.length} blocklists`,
    )

    for (const row of rows) {
      const { id, name, sirens } = row
      await tx.execute(
        'INSERT OR IGNORE INTO blocklist (id, name, sirens) VALUES (?, ?, ?)',
        [id, name, sirens],
      )
    }
  }

  private async migrateDevices(
    tx: Transaction,
    legacyDb: LegacyDb,
  ): Promise<void> {
    const rows = await this.queryLegacy(legacyDb, 'SELECT * FROM "Device"')
    this.logger.info(
      `[PowersyncLegacyMigration] Migrating ${rows.length} devices`,
    )

    for (const row of rows) {
      const { id, type, name } = row
      await tx.execute(
        'INSERT OR IGNORE INTO device (id, type, name) VALUES (?, ?, ?)',
        [id, type, name],
      )
    }
  }

  private async migrateBlockSessions(
    tx: Transaction,
    legacyDb: LegacyDb,
  ): Promise<void> {
    const rows = await this.queryLegacy(
      legacyDb,
      'SELECT * FROM "BlockSession"',
    )
    this.logger.info(
      `[PowersyncLegacyMigration] Migrating ${rows.length} block sessions`,
    )

    for (const row of rows) {
      const {
        id,
        name,
        startedAt,
        endedAt,
        startNotificationId,
        endNotificationId,
        blockingConditions,
      } = row
      await tx.execute(
        `INSERT OR IGNORE INTO block_session
          (id, name, started_at, ended_at, start_notification_id, end_notification_id, blocking_conditions)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          name,
          startedAt,
          endedAt,
          startNotificationId,
          endNotificationId,
          blockingConditions,
        ],
      )
    }
  }

  private async migrateTimers(
    tx: Transaction,
    legacyDb: LegacyDb,
  ): Promise<void> {
    const rows = await this.queryLegacy(legacyDb, 'SELECT * FROM "Timer"')
    this.logger.info(
      `[PowersyncLegacyMigration] Migrating ${rows.length} timers`,
    )

    for (const row of rows) {
      const { id, userId, endedAt } = row
      await tx.execute(
        'INSERT OR IGNORE INTO timer (id, user_id, ended_at) VALUES (?, ?, ?)',
        [id, userId, endedAt],
      )
    }
  }

  private async migrateBlocklistJunctions(
    tx: Transaction,
    legacyDb: LegacyDb,
  ): Promise<void> {
    const rows = await this.queryLegacy(
      legacyDb,
      'SELECT * FROM "_BlockSessionToBlocklist"',
    )
    this.logger.info(
      `[PowersyncLegacyMigration] Migrating ${rows.length} blocklist junctions`,
    )

    for (const row of rows) {
      await tx.execute(
        'INSERT OR IGNORE INTO block_session_blocklist (id, block_session_id, blocklist_id) VALUES (uuid(), ?, ?)',
        [row.A, row.B],
      )
    }
  }

  private async migrateDeviceJunctions(
    tx: Transaction,
    legacyDb: LegacyDb,
  ): Promise<void> {
    const rows = await this.queryLegacy(
      legacyDb,
      'SELECT * FROM "_BlockSessionToDevice"',
    )
    this.logger.info(
      `[PowersyncLegacyMigration] Migrating ${rows.length} device junctions`,
    )

    for (const row of rows) {
      await tx.execute(
        'INSERT OR IGNORE INTO block_session_device (id, block_session_id, device_id) VALUES (uuid(), ?, ?)',
        [row.A, row.B],
      )
    }
  }

  private async markMigrationComplete(tx: Transaction): Promise<void> {
    await tx.execute(
      'INSERT OR REPLACE INTO ps_kv (key, value) VALUES (?, ?)',
      [PowersyncLegacyMigration.MIGRATION_FLAG_KEY, 'true'],
    )
  }

  private getLegacyDbPath(): string {
    const dbName = 'app.db'

    return Platform.OS === 'android'
      ? `${FileSystem.documentDirectory}databases/${dbName}`
      : `${FileSystem.documentDirectory}${dbName}`
  }

  private getLegacyDbLocation(): string {
    return Platform.OS === 'android'
      ? `${FileSystem.documentDirectory}databases/`
      : (FileSystem.documentDirectory ?? '')
  }

  private async queryLegacy(
    legacyDb: LegacyDb,
    sql: string,
  ): Promise<LegacyRow[]> {
    const queryResult = await legacyDb.execute(sql)

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- OP-SQLite rows are Record<string, Scalar>
    return queryResult.rows as LegacyRow[]
  }
}

import { AbstractPowerSyncDatabase } from '@powersync/common'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Logger } from '@/core/_ports_/logger'

export class PowersyncConsentMigration {
  private static readonly CONSENT_KEY = 'accessibility_disclosure_consent'

  private static readonly MIGRATION_FLAG =
    'consent_migration_from_async_storage'

  private readonly db: AbstractPowerSyncDatabase

  private readonly logger: Logger

  constructor(db: AbstractPowerSyncDatabase, logger: Logger) {
    this.db = db
    this.logger = logger
  }

  async migrate(): Promise<void> {
    try {
      const isAlreadyMigrated = await this.checkMigrationFlag()
      if (isAlreadyMigrated) return

      await this.migrateConsentValue()
      await this.markMigrationComplete()
      await this.cleanupLegacyKey()
    } catch (error) {
      this.logger.error(
        `[PowersyncConsentMigration] Failed to migrate: ${error}`,
      )
      throw error
    }
  }

  private async checkMigrationFlag(): Promise<boolean> {
    const flag = await this.db.getOptional<{ value: string }>(
      'SELECT value FROM ps_kv WHERE key = ?',
      [PowersyncConsentMigration.MIGRATION_FLAG],
    )
    return flag !== null
  }

  private async migrateConsentValue(): Promise<void> {
    const legacyValue = await AsyncStorage.getItem(
      PowersyncConsentMigration.CONSENT_KEY,
    )

    if (legacyValue !== 'true') return

    await this.db.execute(
      'INSERT OR REPLACE INTO ps_kv (key, value) VALUES (?, ?)',
      [PowersyncConsentMigration.CONSENT_KEY, 'true'],
    )

    this.logger.info(
      '[PowersyncConsentMigration] Migrated consent from AsyncStorage',
    )
  }

  private async markMigrationComplete(): Promise<void> {
    await this.db.execute(
      'INSERT OR REPLACE INTO ps_kv (key, value) VALUES (?, ?)',
      [PowersyncConsentMigration.MIGRATION_FLAG, 'true'],
    )
  }

  private async cleanupLegacyKey(): Promise<void> {
    await AsyncStorage.removeItem(PowersyncConsentMigration.CONSENT_KEY)
  }
}

import { AbstractPowerSyncDatabase } from '@powersync/common'
import { ConsentRepository } from '@/core/_ports_/consent.repository'
import { Logger } from '@/core/_ports_/logger'

export class PowersyncConsentRepository implements ConsentRepository {
  private static readonly KV_KEY = 'accessibility_disclosure_consent'

  private readonly db: AbstractPowerSyncDatabase

  private readonly logger: Logger

  constructor(db: AbstractPowerSyncDatabase, logger: Logger) {
    this.db = db
    this.logger = logger
  }

  async hasConsented(): Promise<boolean> {
    try {
      const consentRecord = await this.db.getOptional<{ value: string }>(
        'SELECT value FROM ps_kv WHERE key = ?',
        [PowersyncConsentRepository.KV_KEY],
      )
      return consentRecord?.value === 'true'
    } catch (error) {
      this.logger.error(
        `[PowersyncConsentRepository] Failed to hasConsented: ${error}`,
      )
      throw error
    }
  }

  async giveConsent(): Promise<void> {
    try {
      await this.db.execute(
        'INSERT OR REPLACE INTO ps_kv (key, value) VALUES (?, ?)',
        [PowersyncConsentRepository.KV_KEY, 'true'],
      )
    } catch (error) {
      this.logger.error(
        `[PowersyncConsentRepository] Failed to giveConsent: ${error}`,
      )
      throw error
    }
  }
}

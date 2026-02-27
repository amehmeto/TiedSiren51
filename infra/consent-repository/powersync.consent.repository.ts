import { ConsentRepository } from '@/core/_ports_/consent.repository'
import { PowersyncRepository } from '@/infra/__abstract__/powersync.repository'

export class PowersyncConsentRepository
  extends PowersyncRepository
  implements ConsentRepository
{
  private static readonly KV_KEY = 'accessibility_disclosure_consent'

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

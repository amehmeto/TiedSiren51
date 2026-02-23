import { SirensRepository } from '@/core/_ports_/sirens.repository'
import { AndroidSiren, Sirens } from '@/core/siren/sirens'
import { PowersyncRepository } from '@/infra/__abstract__/powersync.repository'
import { SirenRecord } from '@/infra/database-service/powersync.schema'

export class PowersyncSirensRepository
  extends PowersyncRepository
  implements SirensRepository
{
  async getSelectableSirens(userId: string): Promise<Sirens> {
    try {
      const sirens = await this.db.getAll<SirenRecord>(
        'SELECT * FROM siren WHERE user_id = ?',
        [userId],
      )

      return {
        android: sirens
          .filter((s) => s.type === 'android')
          .map((s) => {
            const { value, name, icon } = s

            return {
              packageName: value ?? '',
              appName: name ?? '',
              icon: icon ?? '',
            }
          }),
        ios: [],
        windows: [],
        macos: [],
        linux: [],
        websites: sirens
          .filter((s) => s.type === 'website')
          .map((s) => s.value ?? ''),
        keywords: sirens
          .filter((s) => s.type === 'keyword')
          .map((s) => s.value ?? ''),
      }
    } catch (error) {
      this.logger.error(
        `[PowersyncSirensRepository] Failed to get selectable sirens: ${error}`,
      )
      throw error
    }
  }

  async addKeywordToSirens(userId: string, keyword: string): Promise<void> {
    try {
      await this.db.execute(
        'INSERT INTO siren (id, user_id, type, value, name, icon) VALUES (uuid(), ?, ?, ?, ?, ?)',
        [userId, 'keyword', keyword, '', ''],
      )
    } catch (error) {
      this.logger.error(
        `[PowersyncSirensRepository] Failed to add keyword "${keyword}" to sirens: ${error}`,
      )
      throw error
    }
  }

  async addWebsiteToSirens(userId: string, website: string): Promise<void> {
    try {
      await this.db.execute(
        'INSERT INTO siren (id, user_id, type, value, name, icon) VALUES (uuid(), ?, ?, ?, ?, ?)',
        [userId, 'website', website, '', ''],
      )
    } catch (error) {
      this.logger.error(
        `[PowersyncSirensRepository] Failed to add website "${website}" to sirens: ${error}`,
      )
      throw error
    }
  }

  async addAndroidSirenToSirens(
    userId: string,
    androidSiren: AndroidSiren,
  ): Promise<void> {
    try {
      const { packageName, appName, icon } = androidSiren
      await this.db.execute(
        'INSERT INTO siren (id, user_id, type, value, name, icon) VALUES (uuid(), ?, ?, ?, ?, ?)',
        [userId, 'android', packageName, appName, icon],
      )
    } catch (error) {
      this.logger.error(
        `[PowersyncSirensRepository] Failed to add android siren "${androidSiren.packageName}" to sirens: ${error}`,
      )
      throw error
    }
  }

  async deleteAllSirens(userId: string): Promise<void> {
    try {
      await this.db.execute('DELETE FROM siren WHERE user_id = ?', [userId])
    } catch (error) {
      this.logger.error(
        `[PowersyncSirensRepository] Failed to delete all sirens: ${error}`,
      )
      throw error
    }
  }
}

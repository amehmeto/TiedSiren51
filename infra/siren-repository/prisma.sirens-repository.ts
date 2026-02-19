import { Siren as PrismaSiren } from '@prisma/client'
import uuid from 'react-native-uuid'
import { Logger } from '@/core/_ports_/logger'
import { SirensRepository } from '@/core/_ports_/sirens.repository'
import { AndroidSiren, Sirens } from '@/core/siren/sirens'
import { PrismaRepository } from '@/infra/__abstract__/prisma.repository'

export class PrismaSirensRepository
  extends PrismaRepository
  implements SirensRepository
{
  protected readonly logger: Logger

  constructor(logger: Logger) {
    super()
    this.logger = logger
  }

  async getSelectableSirens(userId: string): Promise<Sirens> {
    try {
      const sirens = await this.baseClient.siren.findMany({
        where: { userId },
      })
      return {
        android: sirens
          .filter((s: PrismaSiren) => s.type === 'android')
          .map((s: PrismaSiren) => ({
            packageName: s.value,
            appName: s.name ?? '',
            icon: s.icon ?? '',
          })),
        ios: [],
        windows: [],
        macos: [],
        linux: [],
        websites: sirens
          .filter((s: PrismaSiren) => s.type === 'website')
          .map((s: PrismaSiren) => s.value),
        keywords: sirens
          .filter((s: PrismaSiren) => s.type === 'keyword')
          .map((s: PrismaSiren) => s.value),
      }
    } catch (error) {
      this.logger.error(
        `[PrismaSirensRepository] Failed to get selectable sirens: ${error}`,
      )
      throw error
    }
  }

  async addKeywordToSirens(userId: string, keyword: string): Promise<void> {
    try {
      await this.baseClient.siren.create({
        data: {
          id: String(uuid.v4()),
          userId,
          type: 'keyword',
          value: keyword,
        },
      })
    } catch (error) {
      this.logger.error(
        `[PrismaSirensRepository] Failed to add keyword "${keyword}" to sirens: ${error}`,
      )
      throw error
    }
  }

  async addWebsiteToSirens(userId: string, website: string): Promise<void> {
    try {
      await this.baseClient.siren.create({
        data: {
          id: String(uuid.v4()),
          userId,
          type: 'website',
          value: website,
        },
      })
    } catch (error) {
      this.logger.error(
        `[PrismaSirensRepository] Failed to add website "${website}" to sirens: ${error}`,
      )
      throw error
    }
  }

  async addAndroidSirenToSirens(
    userId: string,
    androidSiren: AndroidSiren,
  ): Promise<void> {
    try {
      await this.baseClient.siren.create({
        data: {
          id: String(uuid.v4()),
          userId,
          type: 'android',
          value: androidSiren.packageName,
          name: androidSiren.appName,
          icon: androidSiren.icon,
        },
      })
    } catch (error) {
      this.logger.error(
        `[PrismaSirensRepository] Failed to add android siren "${androidSiren.packageName}" to sirens: ${error}`,
      )
      throw error
    }
  }

  async deleteAllSirens(userId: string): Promise<void> {
    try {
      await this.baseClient.siren.deleteMany({
        where: { userId },
      })
    } catch (error) {
      this.logger.error(
        `[PrismaSirensRepository] Failed to delete all sirens: ${error}`,
      )
      throw error
    }
  }
}

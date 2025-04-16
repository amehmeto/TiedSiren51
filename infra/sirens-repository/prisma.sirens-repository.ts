import { Siren as PrismaSiren } from '@prisma/client'
import { AndroidSiren, Sirens } from '@/core/siren/sirens'
import { SirensRepository } from '@/core/ports/sirens.repository'
import uuid from 'react-native-uuid'
import { PrismaRepository } from '@/infra/__abstract__/prisma.repository'

export class PrismaSirensRepository
  extends PrismaRepository
  implements SirensRepository
{
  async getSelectableSirens(): Promise<Sirens> {
    const sirens = await this.baseClient.siren.findMany()
    return {
      android: sirens
        .filter((s: PrismaSiren) => s.type === 'android')
        .map((s: PrismaSiren) => ({
          packageName: s.value,
          appName: s.name || '',
          icon: s.icon || '',
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
  }

  async addKeywordToSirens(keyword: string): Promise<void> {
    await this.baseClient.siren.create({
      data: {
        id: String(uuid.v4()),
        type: 'keyword',
        value: keyword,
      },
    })
  }

  async addWebsiteToSirens(website: string): Promise<void> {
    await this.baseClient.siren.create({
      data: {
        id: String(uuid.v4()),
        type: 'website',
        value: website,
      },
    })
  }

  async addAndroidSirenToSirens(androidSiren: AndroidSiren): Promise<void> {
    await this.baseClient.siren.create({
      data: {
        id: String(uuid.v4()),
        type: 'android',
        value: androidSiren.packageName,
        name: androidSiren.appName,
        icon: androidSiren.icon,
      },
    })
  }
}

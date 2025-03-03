import { Siren as PrismaSiren } from '@prisma/client'
import { AndroidSiren, Sirens } from '@/core/siren/sirens'
import { SirensRepository } from '@/core/ports/sirens.repository'
import { extendedClient } from '@/infra/prisma/databaseService'
import uuid from 'react-native-uuid'

export class PrismaSirensRepository implements SirensRepository {
  private prisma = extendedClient

  async getSelectableSirens(): Promise<Sirens> {
    const sirens = await this.prisma.siren.findMany()
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
    await this.prisma.siren.create({
      data: {
        id: String(uuid.v4()),
        type: 'keyword',
        value: keyword,
      },
    })
  }

  async addWebsiteToSirens(website: string): Promise<void> {
    await this.prisma.siren.create({
      data: {
        id: String(uuid.v4()),
        type: 'website',
        value: website,
      },
    })
  }

  async addAndroidSirenToSirens(androidSiren: AndroidSiren): Promise<void> {
    await this.prisma.siren.create({
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

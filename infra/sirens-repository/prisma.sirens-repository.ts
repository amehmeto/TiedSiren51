import { PrismaClient } from '@prisma/client'
import { AndroidSiren, Sirens } from '@/core/siren/sirens'
import { SirensRepository } from '@/core/ports/sirens.repository'

export class PrismaSirensRepository implements SirensRepository {
  private prisma: PrismaClient

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient()
  }

  async getSelectableSirens(): Promise<Sirens> {
    const sirens = await this.prisma.siren.findMany()
    return {
      android: sirens
        .filter((s) => s.type === 'android')
        .map((s) => ({
          packageName: s.value,
          appName: s.name || '',
          icon: s.icon || '',
        })),
      ios: [],
      windows: [],
      macos: [],
      linux: [],
      websites: sirens.filter((s) => s.type === 'website').map((s) => s.value),
      keywords: sirens.filter((s) => s.type === 'keyword').map((s) => s.value),
    }
  }

  async addKeywordToSirens(keyword: string): Promise<void> {
    await this.prisma.siren.create({
      data: {
        type: 'keyword',
        value: keyword,
      },
    })
  }

  async addWebsiteToSirens(website: string): Promise<void> {
    await this.prisma.siren.create({
      data: {
        type: 'website',
        value: website,
      },
    })
  }

  async addAndroidSirenToSirens(androidSiren: AndroidSiren): Promise<void> {
    await this.prisma.siren.create({
      data: {
        type: 'android',
        value: androidSiren.packageName,
        name: androidSiren.appName,
        icon: androidSiren.icon,
      },
    })
  }
}

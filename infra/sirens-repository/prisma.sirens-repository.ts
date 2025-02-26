/* eslint-disable no-console */
import { Siren as PrismaSiren } from '@prisma/client'
import { AndroidSiren, Sirens } from '@/core/siren/sirens'
import { SirensRepository } from '@/core/ports/sirens.repository'
import { extendedClient } from '@/myDbModule'
import uuid from 'react-native-uuid'

export class PrismaSirensRepository implements SirensRepository {
  private prisma = extendedClient

  async getSelectableSirens(): Promise<Sirens> {
    try {
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
    } catch (error) {
      console.error('GetSelectableSirens error:', error)
      throw error
    }
  }

  async addKeywordToSirens(keyword: string): Promise<void> {
    try {
      await this.prisma.siren.create({
        data: {
          id: String(uuid.v4()),
          type: 'keyword',
          value: keyword,
        },
      })
    } catch (error) {
      console.error('AddKeywordToSirens error:', error)
      throw error
    }
  }

  async addWebsiteToSirens(website: string): Promise<void> {
    try {
      await this.prisma.siren.create({
        data: {
          id: String(uuid.v4()),
          type: 'website',
          value: website,
        },
      })
    } catch (error) {
      console.error('AddWebsiteToSirens error:', error)
      throw error
    }
  }

  async addAndroidSirenToSirens(androidSiren: AndroidSiren): Promise<void> {
    try {
      await this.prisma.siren.create({
        data: {
          id: String(uuid.v4()),
          type: 'android',
          value: androidSiren.packageName,
          name: androidSiren.appName,
          icon: androidSiren.icon,
        },
      })
    } catch (error) {
      console.error('AddAndroidSirenToSirens error:', error)
      throw error
    }
  }
}

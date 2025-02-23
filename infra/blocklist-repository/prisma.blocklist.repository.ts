/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client'
import { Blocklist } from '@/core/blocklist/blocklist'
import { BlocklistRepository } from '@/core/ports/blocklist.repository'
import { UpdatePayload } from '@/core/ports/update.payload'
import { CreatePayload } from '@/core/ports/create.payload'
import { Sirens, SirenType } from '@/core/siren/sirens'

export class PrismaBlocklistRepository implements BlocklistRepository {
  private typedPrisma: PrismaClient

  constructor(prisma: PrismaClient | ReturnType<PrismaClient['$extends']>) {
    this.typedPrisma = prisma as PrismaClient
  }

  private async getSirensForBlocklist(blocklistId: string): Promise<Sirens> {
    const sirens = await this.typedPrisma.siren.findMany({
      where: {
        blocklists: {
          some: {
            id: blocklistId,
          },
        },
      },
    })

    const initialSirens: Sirens = {
      android: [],
      windows: [],
      macos: [],
      ios: [],
      linux: [],
      websites: [],
      keywords: [],
    }

    return sirens.reduce((acc: Sirens, siren) => {
      switch (siren.type) {
        case SirenType.ANDROID:
          acc.android.push({
            packageName: siren.value,
            appName: siren.name || '',
            icon: siren.icon || '',
          })
          break
        case SirenType.WINDOWS:
          acc.windows.push(siren.value)
          break
        case SirenType.MACOS:
          acc.macos.push(siren.value)
          break
        case SirenType.IOS:
          acc.ios.push(siren.value)
          break
        case SirenType.LINUX:
          acc.linux.push(siren.value)
          break
        case SirenType.WEBSITES:
          acc.websites.push(siren.value)
          break
        case SirenType.KEYWORDS:
          acc.keywords.push(siren.value)
          break
      }
      return acc
    }, initialSirens)
  }

  private async createSirens(sirens: Sirens, blocklistId: string) {
    // Create Android sirens
    for (const siren of sirens.android) {
      await this.typedPrisma.siren.create({
        data: {
          type: SirenType.ANDROID,
          value: siren.packageName,
          name: siren.appName,
          icon: siren.icon,
          blocklists: {
            connect: { id: blocklistId },
          },
        },
      })
    }

    // Create other siren types
    const otherTypes = [
      'windows',
      'macos',
      'ios',
      'linux',
      'websites',
      'keywords',
    ] as const
    for (const type of otherTypes) {
      for (const value of sirens[type]) {
        await this.typedPrisma.siren.create({
          data: {
            type,
            value,
            blocklists: {
              connect: { id: blocklistId },
            },
          },
        })
      }
    }
  }

  async findAll(): Promise<Blocklist[]> {
    try {
      const blocklists = await this.typedPrisma.blocklist.findMany()

      const blocklistsWithSirens = await Promise.all(
        blocklists.map(async (blocklist) => ({
          id: blocklist.id,
          name: blocklist.name,
          sirens: await this.getSirensForBlocklist(blocklist.id),
        })),
      )

      return blocklistsWithSirens
    } catch (error) {
      console.error('Error finding all blocklists:', error)
      throw new Error('Failed to fetch blocklists')
    }
  }

  async create(blocklistPayload: CreatePayload<Blocklist>): Promise<Blocklist> {
    try {
      const created = await this.typedPrisma.blocklist.create({
        data: {
          name: blocklistPayload.name,
        },
      })

      await this.createSirens(blocklistPayload.sirens, created.id)

      return {
        id: created.id,
        name: created.name,
        sirens: blocklistPayload.sirens,
      }
    } catch (error) {
      console.error('Error creating blocklist:', error)
      throw new Error('Failed to create blocklist')
    }
  }

  async findById(id: string): Promise<Blocklist> {
    try {
      const blocklist = await this.typedPrisma.blocklist.findUnique({
        where: { id },
      })

      if (!blocklist) {
        throw new Error(`Blocklist with id ${id} not found`)
      }

      return {
        id: blocklist.id,
        name: blocklist.name,
        sirens: await this.getSirensForBlocklist(id),
      }
    } catch (error) {
      console.error(`Error finding blocklist with id ${id}:`, error)
      throw error
    }
  }

  async update(blocklistPayload: UpdatePayload<Blocklist>): Promise<void> {
    try {
      // Update blocklist name
      await this.typedPrisma.blocklist.update({
        where: { id: blocklistPayload.id },
        data: {
          name: blocklistPayload.name,
        },
      })

      if (blocklistPayload.sirens) {
        // Delete existing sirens
        await this.typedPrisma.siren.deleteMany({
          where: {
            blocklists: {
              some: {
                id: blocklistPayload.id,
              },
            },
          },
        })

        // Create new sirens
        await this.createSirens(blocklistPayload.sirens, blocklistPayload.id)
      }
    } catch (error) {
      console.error('Error updating blocklist:', error)
      throw new Error('Failed to update blocklist')
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.typedPrisma.blocklist.delete({
        where: { id },
      })
    } catch (error) {
      console.error('Error deleting blocklist:', error)
      throw new Error('Failed to delete blocklist')
    }
  }
}

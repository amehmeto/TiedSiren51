/* eslint-disable no-console */
import { Blocklist } from '@/core/blocklist/blocklist'
import { BlocklistRepository } from '@/core/ports/blocklist.repository'
import { CreatePayload } from '@/core/ports/create.payload'
import { UpdatePayload } from '@/core/ports/update.payload'
import { extendedClient } from '@/myDbModule'

export class PrismaBlocklistRepository implements BlocklistRepository {
  private prisma = extendedClient

  async create(blocklistPayload: CreatePayload<Blocklist>): Promise<Blocklist> {
    try {
      console.log('Creating blocklist:', blocklistPayload)
      const created = await this.prisma.blocklist.create({
        data: {
          name: blocklistPayload.name,
          sirens: JSON.stringify(
            blocklistPayload.sirens || {
              android: [],
              ios: [],
              windows: [],
              macos: [],
              linux: [],
              websites: [],
              keywords: [],
            },
          ),
        },
      })

      return {
        id: created.id,
        name: created.name,
        sirens: JSON.parse(created.sirens),
      }
    } catch (error) {
      console.error('Create error:', error)
      throw error
    }
  }

  async findAll(): Promise<Blocklist[]> {
    try {
      console.log('Fetching blocklists...')
      const blocklists = await this.prisma.blocklist.findMany()

      const parsedBlocklists = blocklists.map((b) => {
        let parsedSirens
        try {
          parsedSirens = JSON.parse(b.sirens)
        } catch (e) {
          console.log('Error parsing sirens for blocklist:', b.id)
          parsedSirens = {
            android: [],
            ios: [],
            windows: [],
            macos: [],
            linux: [],
            websites: [],
            keywords: [],
          }
        }

        return {
          id: b.id,
          name: b.name,
          sirens: parsedSirens,
        }
      })

      console.log('Parsed blocklists:', parsedBlocklists)
      return parsedBlocklists
    } catch (error) {
      console.error('FindAll error:', error)
      throw error
    }
  }

  async update(payload: UpdatePayload<Blocklist>): Promise<void> {
    try {
      await this.prisma.blocklist.update({
        where: { id: payload.id },
        data: {
          name: payload.name,
          sirens: JSON.stringify(payload.sirens),
        },
      })
    } catch (error) {
      console.error('Update error:', error)
      throw error
    }
  }

  async findById(id: string): Promise<Blocklist> {
    const blocklist = await this.prisma.blocklist.findUnique({
      where: { id },
    })

    if (!blocklist) {
      throw new Error(`Blocklist ${id} not found`)
    }

    return {
      id: blocklist.id,
      name: blocklist.name,
      sirens: JSON.parse(blocklist.sirens),
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.blocklist.delete({
        where: { id },
      })
    } catch (error) {
      console.error('Delete error:', error)
      throw error
    }
  }
}

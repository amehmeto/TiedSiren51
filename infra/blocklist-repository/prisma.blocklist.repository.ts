/* eslint-disable no-console */
import { Blocklist } from '@/core/blocklist/blocklist'
import { BlocklistRepository } from '@/core/ports/blocklist.repository'
import { CreatePayload } from '@/core/ports/create.payload'
import { UpdatePayload } from '@/core/ports/update.payload'
import { baseClient } from '@/myDbModule'
import { PrismaClient } from '@prisma/client/react-native'

export class PrismaBlocklistRepository implements BlocklistRepository {
  constructor(private prisma: PrismaClient = baseClient) {}

  async create(blocklistPayload: CreatePayload<Blocklist>): Promise<Blocklist> {
    try {
      console.log('Creating blocklist in DB:', blocklistPayload)
      const created = await this.prisma.$transaction(async (tx) => {
        return tx.blocklist.create({
          data: {
            name: blocklistPayload.name,
            sirens: JSON.stringify(blocklistPayload.sirens),
          },
        })
      })
      console.log('DB creation result:', created)
      return {
        ...blocklistPayload,
        id: created.id,
      }
    } catch (error) {
      console.error('Error creating blocklist:', error)
      throw new Error('Failed to create blocklist')
    }
  }

  async findAll(): Promise<Blocklist[]> {
    try {
      console.log('Fetching all blocklists...')
      const blocklists = await this.prisma.$transaction(async (tx) => {
        return tx.blocklist.findMany()
      })
      console.log('Found blocklists in DB:', blocklists)
      return blocklists.map((blocklist) => ({
        id: blocklist.id,
        name: blocklist.name,
        sirens: JSON.parse(blocklist.sirens),
      }))
    } catch (error) {
      console.error('Error fetching blocklists:', error)
      throw new Error('Failed to fetch blocklists')
    }
  }

  async findById(id: string): Promise<Blocklist> {
    const blocklist = await this.prisma.$transaction(async (tx) => {
      const result = await tx.blocklist.findUnique({
        where: { id },
      })
      if (!result) {
        throw new Error(`Blocklist with id ${id} not found`)
      }
      return result
    })

    return {
      id: blocklist.id,
      name: blocklist.name,
      sirens: JSON.parse(blocklist.sirens),
    }
  }

  async update(updateBlocklist: UpdatePayload<Blocklist>): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.blocklist.update({
        where: { id: updateBlocklist.id },
        data: {
          name: updateBlocklist.name,
          sirens: updateBlocklist.sirens
            ? JSON.stringify(updateBlocklist.sirens)
            : undefined,
        },
      })
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.blocklist.delete({
        where: { id },
      })
    })
  }
}

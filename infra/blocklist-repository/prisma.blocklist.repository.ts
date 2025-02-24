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
    console.log('Creating blocklist in DB:', blocklistPayload)
    const created = await this.prisma.blocklist.create({
      data: {
        name: blocklistPayload.name,
        sirens: JSON.stringify(blocklistPayload.sirens),
      },
    })
    console.log('DB creation result:', created)

    return {
      ...blocklistPayload,
      id: created.id,
    }
  }

  async findAll(): Promise<Blocklist[]> {
    console.log('Fetching all blocklists...')
    const blocklists = await this.prisma.blocklist.findMany()
    console.log('Found blocklists in DB:', blocklists)

    return blocklists.map((blocklist) => ({
      id: blocklist.id,
      name: blocklist.name,
      sirens: JSON.parse(blocklist.sirens),
    }))
  }

  async findById(id: string): Promise<Blocklist> {
    const blocklist = await this.prisma.blocklist.findUnique({
      where: { id },
    })

    if (!blocklist) {
      throw new Error(`Blocklist with id ${id} not found`)
    }

    return {
      id: blocklist.id,
      name: blocklist.name,
      sirens: JSON.parse(blocklist.sirens),
    }
  }

  async update(updateBlocklist: UpdatePayload<Blocklist>): Promise<void> {
    await this.prisma.blocklist.update({
      where: { id: updateBlocklist.id },
      data: {
        name: updateBlocklist.name,
        sirens: updateBlocklist.sirens
          ? JSON.stringify(updateBlocklist.sirens)
          : undefined,
      },
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.blocklist.delete({
      where: { id },
    })
  }
}

import { PrismaClient } from '@prisma/client'
import { Blocklist } from '@/core/blocklist/blocklist'
import { BlocklistRepository } from '@/core/ports/blocklist.repository'
import { CreatePayload } from '@/core/ports/create.payload'
import { UpdatePayload } from '@/core/ports/update.payload'

export class PrismaBlocklistRepository implements BlocklistRepository {
  private prisma: PrismaClient

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient()
  }

  async create(blocklistPayload: CreatePayload<Blocklist>): Promise<Blocklist> {
    const created = await this.prisma.blocklist.create({
      data: {
        name: blocklistPayload.name,
        sirens: JSON.stringify(blocklistPayload.sirens || []),
      },
    })

    return this.mapToBlocklist(created)
  }

  async findById(id: string): Promise<Blocklist> {
    const blocklist = await this.prisma.blocklist.findUnique({
      where: { id },
    })

    if (!blocklist) {
      throw new Error(`Blocklist with id ${id} not found`)
    }

    return this.mapToBlocklist(blocklist)
  }

  async findAll(): Promise<Blocklist[]> {
    const blocklists = await this.prisma.blocklist.findMany()
    return blocklists.map((bl) => ({
      ...bl,
      sirens: JSON.parse(bl.sirens),
    }))
  }

  async update(blocklistPayload: UpdatePayload<Blocklist>): Promise<void> {
    await this.prisma.blocklist.update({
      where: { id: blocklistPayload.id },
      data: {
        name: blocklistPayload.name,
        sirens: blocklistPayload.sirens
          ? JSON.stringify(blocklistPayload.sirens)
          : undefined,
      },
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.blocklist.delete({
      where: { id },
    })
  }

  private mapToBlocklist(prismaBlocklist: any): Blocklist {
    return {
      id: prismaBlocklist.id,
      name: prismaBlocklist.name,
      sirens: JSON.parse(prismaBlocklist.sirens),
    }
  }
}

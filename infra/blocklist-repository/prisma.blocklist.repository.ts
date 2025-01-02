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
        sirens: JSON.stringify(blocklistPayload.sirens),
      },
    })

    return {
      ...blocklistPayload,
      id: created.id,
    }
  }

  findAll(): Promise<Blocklist[]> {
    return Promise.resolve([])
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

import { Blocklist } from '@/core/blocklist/blocklist'
import { BlocklistRepository } from '@/core/ports/blocklist.repository'
import { CreatePayload } from '@/core/ports/create.payload'
import { UpdatePayload } from '@/core/ports/update.payload'
import { PrismaRepository } from '@/infra/__abstract__/prisma.repository'

type DbBlocklist = {
  id: string
  name: string
  sirens: string
}

export class PrismaBlocklistRepository
  extends PrismaRepository
  implements BlocklistRepository
{
  async create(blocklistPayload: CreatePayload<Blocklist>): Promise<Blocklist> {
    const created = await this.baseClient.blocklist.create({
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

    return this.mapToBlocklist(created)
  }

  async findAll(): Promise<Blocklist[]> {
    const blocklists = await this.baseClient.blocklist.findMany()
    return blocklists.map(this.mapToBlocklist)
  }

  async update(payload: UpdatePayload<Blocklist>): Promise<void> {
    await this.baseClient.blocklist.update({
      where: { id: payload.id },
      data: {
        name: payload.name,
        sirens: JSON.stringify(payload.sirens),
      },
    })
  }

  async findById(id: string): Promise<Blocklist> {
    const blocklist = await this.baseClient.blocklist.findUnique({
      where: { id },
    })

    if (!blocklist) {
      throw new Error(`Blocklist ${id} not found`)
    }

    return this.mapToBlocklist(blocklist)
  }

  async delete(id: string): Promise<void> {
    await this.baseClient.blocklist.delete({
      where: { id },
    })
  }

  private mapToBlocklist(dbBlocklist: DbBlocklist): Blocklist {
    return {
      id: dbBlocklist.id,
      name: dbBlocklist.name,
      sirens: JSON.parse(dbBlocklist.sirens),
    }
  }
}

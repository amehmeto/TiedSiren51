import { BlocklistRepository } from '@/core/_ports_/blocklist.repository'
import { CreatePayload } from '@/core/_ports_/create.payload'
import { Logger } from '@/core/_ports_/logger'
import { UpdatePayload } from '@/core/_ports_/update.payload'
import { Blocklist } from '@/core/blocklist/blocklist'
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
  protected readonly logger: Logger

  constructor(logger: Logger) {
    super()
    this.logger = logger
  }

  async create(blocklistPayload: CreatePayload<Blocklist>): Promise<Blocklist> {
    try {
      const created = await this.baseClient.blocklist.create({
        data: {
          name: blocklistPayload.name,
          sirens: JSON.stringify(blocklistPayload.sirens),
        },
      })

      return this.mapToBlocklist(created)
    } catch (error) {
      this.logger.error(
        `[PrismaBlocklistRepository] Failed to create blocklist: ${error}`,
      )
      throw error
    }
  }

  async findAll(): Promise<Blocklist[]> {
    try {
      const blocklists = await this.baseClient.blocklist.findMany()
      return blocklists.map(this.mapToBlocklist)
    } catch (error) {
      this.logger.error(
        `[PrismaBlocklistRepository] Failed to find all blocklists: ${error}`,
      )
      throw error
    }
  }

  async update(payload: UpdatePayload<Blocklist>): Promise<void> {
    try {
      await this.baseClient.blocklist.update({
        where: { id: payload.id },
        data: {
          name: payload.name,
          sirens: JSON.stringify(payload.sirens),
        },
      })
    } catch (error) {
      this.logger.error(
        `[PrismaBlocklistRepository] Failed to update blocklist ${payload.id}: ${error}`,
      )
      throw error
    }
  }

  async findById(id: string): Promise<Blocklist> {
    try {
      const blocklist = await this.baseClient.blocklist.findUnique({
        where: { id },
      })

      if (!blocklist) throw new Error(`Blocklist ${id} not found`)

      return this.mapToBlocklist(blocklist)
    } catch (error) {
      this.logger.error(
        `[PrismaBlocklistRepository] Failed to find blocklist ${id}: ${error}`,
      )
      throw error
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.baseClient.blocklist.delete({
        where: { id },
      })
    } catch (error) {
      this.logger.error(
        `[PrismaBlocklistRepository] Failed to delete blocklist ${id}: ${error}`,
      )
      throw error
    }
  }

  async deleteAll(): Promise<void> {
    try {
      await this.baseClient.blocklist.deleteMany()
    } catch (error) {
      this.logger.error(
        `[PrismaBlocklistRepository] Failed to delete all blocklists: ${error}`,
      )
      throw error
    }
  }

  private mapToBlocklist(dbBlocklist: DbBlocklist): Blocklist {
    return {
      id: dbBlocklist.id,
      name: dbBlocklist.name,
      sirens: JSON.parse(dbBlocklist.sirens),
    }
  }
}

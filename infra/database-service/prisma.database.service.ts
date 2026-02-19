import { DatabaseService } from '@/core/_ports_/database.service'
import { Logger } from '@/core/_ports_/logger'
import { PrismaRepository } from '@/infra/__abstract__/prisma.repository'

export class PrismaDatabaseService
  extends PrismaRepository
  implements DatabaseService
{
  protected readonly logger: Logger

  constructor(logger: Logger) {
    super()
    this.logger = logger
  }

  getDbPath(): string {
    return super.getDbPath()
  }

  async initialize(): Promise<void> {
    try {
      return super.initialize()
    } catch (error) {
      this.logger.error(
        `[PrismaDatabaseService] Failed to initialize: ${error}`,
      )
      throw error
    }
  }

  async claimOrphanedData(userId: string): Promise<void> {
    try {
      await this.baseClient.$executeRawUnsafe(
        `UPDATE "Siren" SET "userId" = ? WHERE "userId" = ''`,
        userId,
      )
      await this.baseClient.$executeRawUnsafe(
        `UPDATE "Blocklist" SET "userId" = ? WHERE "userId" = ''`,
        userId,
      )
      await this.baseClient.$executeRawUnsafe(
        `UPDATE "BlockSession" SET "userId" = ? WHERE "userId" = ''`,
        userId,
      )
      this.logger.info(
        `[PrismaDatabaseService] Claimed orphaned data for user ${userId}`,
      )
    } catch (error) {
      this.logger.error(
        `[PrismaDatabaseService] Failed to claim orphaned data: ${error}`,
      )
      throw error
    }
  }
}

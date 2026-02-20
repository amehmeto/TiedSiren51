import { ISODateString } from '@/core/_ports_/date-provider'
import { Logger } from '@/core/_ports_/logger'
import { TimerRepository } from '@/core/_ports_/timer.repository'
import { PrismaRepository } from '@/infra/__abstract__/prisma.repository'

export class PrismaTimerRepository
  extends PrismaRepository
  implements TimerRepository
{
  protected readonly logger: Logger

  constructor(logger: Logger) {
    super()
    this.logger = logger
  }

  async saveTimer(userId: string, endedAt: ISODateString): Promise<void> {
    try {
      await this.ensureInitialized()
      await this.baseClient.timer.upsert({
        where: { id: userId },
        create: {
          id: userId,
          userId,
          endedAt,
        },
        update: {
          endedAt,
        },
      })
    } catch (error) {
      this.logger.error(`[PrismaTimerRepository] Failed to saveTimer: ${error}`)
      throw error
    }
  }

  async loadTimer(userId: string): Promise<ISODateString | null> {
    try {
      await this.ensureInitialized()
      const timer = await this.baseClient.timer.findUnique({
        where: { id: userId },
      })

      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Prisma stores ISO strings
      return timer ? (timer.endedAt as ISODateString) : null
    } catch (error) {
      this.logger.error(`[PrismaTimerRepository] Failed to loadTimer: ${error}`)
      throw error
    }
  }
}

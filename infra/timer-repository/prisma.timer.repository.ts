import { Logger } from '@/core/_ports_/logger'
import { ISODateString } from '@/core/_ports_/port.date-provider'
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

  async saveTimer(userId: string, endAt: ISODateString): Promise<void> {
    await this.baseClient.timer.upsert({
      where: { id: userId },
      create: {
        id: userId,
        userId,
        endAt,
      },
      update: {
        endAt,
      },
    })
  }

  async loadTimer(userId: string): Promise<ISODateString | null> {
    const timer = await this.baseClient.timer.findUnique({
      where: { id: userId },
    })

    if (!timer) return null

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Prisma stores ISO strings
    return timer.endAt as ISODateString
  }
}

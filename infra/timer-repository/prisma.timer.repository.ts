import { TimerRepository } from '@/core/_ports_/timer.repository'
import { PrismaRepository } from '@/infra/__abstract__/prisma.repository'

export class PrismaTimerRepository
  extends PrismaRepository
  implements TimerRepository
{
  async saveTimer(userId: string, endAt: string): Promise<void> {
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

  async loadTimer(userId: string): Promise<string | null> {
    const timer = await this.baseClient.timer.findUnique({
      where: { id: userId },
    })

    if (!timer) return null

    return timer.endAt
  }
}

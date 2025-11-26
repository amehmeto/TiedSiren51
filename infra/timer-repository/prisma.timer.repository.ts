import { TimerRepository, TimerData } from '@/core/_ports_/timer.repository'
import { PrismaRepository } from '@/infra/__abstract__/prisma.repository'

export class PrismaTimerRepository
  extends PrismaRepository
  implements TimerRepository
{
  async saveTimer(userId: string, data: TimerData): Promise<void> {
    await this.baseClient.timer.upsert({
      where: { id: userId },
      create: {
        id: userId,
        userId,
        endAt: data.endAt,
      },
      update: {
        endAt: data.endAt,
      },
    })
  }

  async loadTimer(userId: string): Promise<TimerData | null> {
    const timer = await this.baseClient.timer.findUnique({
      where: { id: userId },
    })

    if (!timer) return null

    return {
      endAt: timer.endAt,
    }
  }
}

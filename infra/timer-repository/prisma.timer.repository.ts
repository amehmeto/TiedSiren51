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
        duration: data.duration,
        isActive: data.isActive ? 1 : 0,
      },
      update: {
        endAt: data.endAt,
        duration: data.duration,
        isActive: data.isActive ? 1 : 0,
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
      duration: timer.duration,
      isActive: timer.isActive === 1,
    }
  }

  async clearTimer(userId: string): Promise<void> {
    await this.baseClient.timer.deleteMany({
      where: { id: userId },
    })
  }
}

import { ISODateString } from '@/core/_ports_/date-provider'
import { TimerRepository } from '@/core/_ports_/timer.repository'

export class FakeDataTimerRepository implements TimerRepository {
  private timers = new Map<string, ISODateString>()

  async saveTimer(userId: string, endedAt: ISODateString): Promise<void> {
    this.timers.set(userId, endedAt)
  }

  async loadTimer(userId: string): Promise<ISODateString | null> {
    return this.timers.get(userId) ?? null
  }
}

import { TimerRepository, TimerData } from '@/core/_ports_/timer.repository'

export class FakeDataTimerRepository implements TimerRepository {
  private timers = new Map<string, TimerData>()

  async saveTimer(userId: string, data: TimerData): Promise<void> {
    this.timers.set(userId, data)
  }

  async loadTimer(userId: string): Promise<TimerData | null> {
    return this.timers.get(userId) ?? null
  }
}

import { TimerRepository } from '@/core/_ports_/timer.repository'

export class FakeDataTimerRepository implements TimerRepository {
  private timers = new Map<string, string>()

  async saveTimer(userId: string, endAt: string): Promise<void> {
    this.timers.set(userId, endAt)
  }

  async loadTimer(userId: string): Promise<string | null> {
    return this.timers.get(userId) ?? null
  }
}

import { Logger } from '@/core/_ports_/logger'
import { BlockingSchedule, SirenTier } from '@core/_ports_/siren.tier'

export class InMemorySirenTier implements SirenTier {
  schedules: BlockingSchedule[] = []

  isNativeBlockingInitialized = false

  shouldThrowOnSync = false

  constructor(private readonly logger: Logger) {}

  async initializeNativeBlocking(): Promise<void> {
    this.logger.info(
      '[InMemorySirenTier] Native blocking initialized (in-memory)',
    )
    this.isNativeBlockingInitialized = true
  }

  async updateBlockingSchedule(schedule: BlockingSchedule[]): Promise<void> {
    if (this.shouldThrowOnSync)
      throw new Error('Update blocking schedule failed')
    this.logger.info(
      `[InMemorySirenTier] Updated blocking schedule: ${schedule.length} schedules`,
    )
    this.schedules = schedule
  }
}

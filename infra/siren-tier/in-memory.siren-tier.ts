import { Logger } from '@/core/_ports_/logger'
import { BlockingSchedule, SirenTier } from '@core/_ports_/siren.tier'

export class InMemorySirenTier implements SirenTier {
  schedules: BlockingSchedule[] = []

  isNativeBlockingInitialized = false

  constructor(private readonly logger: Logger) {}

  async initializeNativeBlocking(): Promise<void> {
    this.logger.info(
      '[InMemorySirenTier] Native blocking initialized (in-memory)',
    )
    this.isNativeBlockingInitialized = true
  }

  async block(schedules: BlockingSchedule[]): Promise<void> {
    try {
      this.logger.info(
        `[InMemorySirenTier] Set ${schedules.length} blocking schedules`,
      )
      this.schedules = schedules
    } catch (error) {
      this.logger.error(
        `[InMemorySirenTier] Failed to set blocking schedule: ${error}`,
      )
      throw error
    }
  }
}

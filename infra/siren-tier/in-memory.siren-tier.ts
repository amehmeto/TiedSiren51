import { Logger } from '@/core/_ports_/logger'
import { BlockingWindow, SirenTier } from '@core/_ports_/siren.tier'

export class InMemorySirenTier implements SirenTier {
  schedule: BlockingWindow[] = []

  isNativeBlockingInitialized = false

  constructor(private readonly logger: Logger) {}

  async initializeNativeBlocking(): Promise<void> {
    this.logger.info(
      '[InMemorySirenTier] Native blocking initialized (in-memory)',
    )
    this.isNativeBlockingInitialized = true
  }

  async block(schedule: BlockingWindow[]): Promise<void> {
    try {
      this.logger.info(
        `[InMemorySirenTier] Set blocking schedule with ${schedule.length} windows`,
      )
      this.schedule = schedule
    } catch (error) {
      this.logger.error(
        `[InMemorySirenTier] Failed to set blocking schedule: ${error}`,
      )
      throw error
    }
  }
}

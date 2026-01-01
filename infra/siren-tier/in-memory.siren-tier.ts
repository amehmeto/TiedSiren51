import { Logger } from '@/core/_ports_/logger'
import { BlockingSchedule, SirenTier } from '@core/_ports_/siren.tier'

export class InMemorySirenTier implements SirenTier {
  blockedApps: string[] = []

  blockingSchedule: BlockingSchedule | null = null

  isNativeBlockingInitialized = false

  constructor(private readonly logger: Logger) {}

  async initialize(): Promise<void> {
    this.logger.info('Native blocking initialized (in-memory)')
    this.isNativeBlockingInitialized = true
  }

  async setBlockingSchedule(schedule: BlockingSchedule): Promise<void> {
    this.logger.info(
      `[InMemorySirenTier] Set blocking schedule with ${schedule.windows.length} windows`,
    )
    this.blockingSchedule = schedule
  }

  /** @deprecated Use setBlockingSchedule instead. Will be removed in native-to-native blocking migration. */
  async block(packageName: string): Promise<void> {
    try {
      this.logger.info(`Blocking app: ${packageName}`)
      this.blockedApps.push(packageName)
    } catch (error) {
      this.logger.error(
        `[InMemorySirenTier] Failed to block app "${packageName}": ${error}`,
      )
      throw error
    }
  }

  /** @deprecated Use initialize instead */
  async initializeNativeBlocking(): Promise<void> {
    await this.initialize()
  }
}

import { Logger } from '@/core/_ports_/logger'
import { SirenTier } from '@core/_ports_/siren.tier'

export class InMemorySirenTier implements SirenTier {
  blockedApps: string[] = []

  isNativeBlockingInitialized = false

  constructor(private readonly logger: Logger) {}

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

  async initializeNativeBlocking(): Promise<void> {
    this.logger.info('Native blocking initialized (in-memory)')
    this.isNativeBlockingInitialized = true
  }
}

import { Logger } from '@/core/_ports_/logger'
import { SirenTier } from '@core/_ports_/siren.tier'
import { Sirens } from '@core/siren/sirens'

export class InMemorySirenTier implements SirenTier {
  sirens?: Sirens = undefined

  blockedApps: string[] = []

  isNativeBlockingInitialized = false

  constructor(private readonly logger: Logger) {}

  async target(sirens: Sirens): Promise<void> {
    try {
      this.logger.info(
        `Targeted sirens: ${sirens.android.map((app) => app.appName).join(', ')}`,
      )
      this.sirens = sirens
    } catch (error) {
      this.logger.error(`[InMemorySirenTier] Failed to target sirens: ${error}`)
      throw error
    }
  }

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

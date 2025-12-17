import { showOverlay } from '@amehmeto/tied-siren-blocking-overlay'
import { Logger } from '@/core/_ports_/logger'
import { SirenTier } from '@core/_ports_/siren.tier'
import { Sirens } from '@core/siren/sirens'

export class AndroidSirenTier implements SirenTier {
  constructor(private readonly logger: Logger) {}

  async target(sirens: Sirens): Promise<void> {
    try {
      this.logger.info(
        `Targeted sirens: ${sirens.android.map((app) => app.appName).join(', ')}`,
      )
    } catch (error) {
      this.logger.error(`[AndroidSirenTier] Failed to target: ${error}`)
      throw error
    }
  }

  async block(packageName: string): Promise<void> {
    try {
      await showOverlay(packageName)
      this.logger.info(`Blocking overlay shown for: ${packageName}`)
    } catch (error) {
      this.logger.error(
        `[AndroidSirenTier] Failed to show blocking overlay for ${packageName}: ${error}`,
      )
      throw error
    }
  }
}

import { showOverlay } from '@amehmeto/tied-siren-blocking-overlay'
import { Logger } from '@/core/_ports_/logger'
import { SirenTier } from '@core/_ports_/siren.tier'
import { Sirens } from '@core/siren/sirens'

export class AndroidSirenTier implements SirenTier {
  constructor(private readonly logger: Logger) {}

  async target(sirens: Sirens): Promise<void> {
    this.logger.info(
      `Targeted sirens: ${sirens.android.map((app) => app.appName).join(', ')}`,
    )
  }

  async block(packageName: string): Promise<void> {
    await showOverlay(packageName)
  }
}

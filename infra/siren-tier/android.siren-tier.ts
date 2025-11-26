import { showOverlay } from '@amehmeto/tied-siren-blocking-overlay'
import { SirenTier } from '@core/_ports_/siren.tier'
import { Sirens } from '@core/siren/sirens'

export class AndroidSirenTier implements SirenTier {
  async target(sirens: Sirens): Promise<void> {
    // eslint-disable-next-line no-console
    console.log(
      'Targeted sirens:',
      sirens.android.map((app) => app.appName),
    )
  }

  async block(packageName: string): Promise<void> {
    await showOverlay(packageName)
  }
}

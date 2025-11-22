import { SirenTier } from '@core/_ports_/siren.tier'
import { Sirens } from '@core/siren/sirens'

export class InMemorySirenTier implements SirenTier {
  sirens?: Sirens = undefined

  blockedApps: string[] = []

  async target(sirens: Sirens): Promise<void> {
    // eslint-disable-next-line no-console
    console.log(
      'Targeted sirens:',
      sirens.android.map((app) => app.appName),
    )
    this.sirens = sirens
  }

  async block(packageName: string): Promise<void> {
    // eslint-disable-next-line no-console
    console.log('Blocking app:', packageName)
    this.blockedApps.push(packageName)
  }
}

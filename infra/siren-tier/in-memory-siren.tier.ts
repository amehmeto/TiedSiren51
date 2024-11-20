import { SirenTier } from '@/core/ports/siren.tier'
import { Sirens } from '@/core/siren/sirens'

export class InMemorySirenTier implements SirenTier {
  sirens?: Sirens = undefined

  async tie(sirens: Sirens): Promise<void> {
    // eslint-disable-next-line no-console
    console.log(
      'Tied sirens:',
      sirens.android.map((app) => app.appName),
    )
    this.sirens = sirens
  }
}

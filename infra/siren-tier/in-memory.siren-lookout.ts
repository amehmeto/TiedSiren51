import { Sirens } from '@/core/siren/sirens'
import { SirenLookout } from '@core/_ports_/siren.lookout'

export class InMemorySirenLookout implements SirenLookout {
  sirens?: Sirens = undefined

  watchSirens(sirens: Sirens): void {
    // eslint-disable-next-line no-console
    console.log(
      'Looking out fo sirens:',
      sirens.android.map((app) => app.appName),
    )
    this.sirens = sirens
  }
}

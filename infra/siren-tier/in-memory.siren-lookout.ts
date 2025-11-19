import * as AccessibilityService from '@amehmeto/expo-accessibility-service'
import { Sirens } from '@/core/siren/sirens'
import { AndroidSirenLookout } from '@core/_ports_/siren.lookout'

export class InMemorySirenLookout implements AndroidSirenLookout {
  sirens?: Sirens = undefined

  watchSirens(sirens: Sirens): void {
    // eslint-disable-next-line no-console
    console.log(
      'Looking out fo sirens:',
      sirens.android.map((app) => app.appName),
    )
    this.sirens = sirens
  }

  async isEnabled(): Promise<boolean> {
    try {
      return await AccessibilityService.isEnabled()
    } catch {
      return false
    }
  }

  async askPermission(): Promise<void> {
    await AccessibilityService.askPermission()
  }
}

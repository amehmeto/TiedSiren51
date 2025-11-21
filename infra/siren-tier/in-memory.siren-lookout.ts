import * as AccessibilityService from '@amehmeto/expo-accessibility-service'
import { Sirens } from '@/core/siren/sirens'
import { AndroidSirenLookout } from '@core/_ports_/siren.lookout'

export class InMemorySirenLookout implements AndroidSirenLookout {
  sirens?: Sirens = undefined

  private listener?: (packageName: string) => void

  watchSirens(sirens: Sirens): void {
    // eslint-disable-next-line no-console
    console.log(
      'Looking out for sirens:',
      sirens.android.map((app) => app.appName),
    )
    this.sirens = sirens
  }

  onSirenDetected(listener: (packageName: string) => void): void {
    this.listener = listener
  }

  // Test helper method to simulate detection
  simulateDetection(packageName: string): void {
    if (this.listener) this.listener(packageName)
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

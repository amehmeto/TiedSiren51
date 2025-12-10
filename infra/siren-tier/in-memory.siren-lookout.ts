import * as AccessibilityService from '@amehmeto/expo-accessibility-service'
import { Logger } from '@/core/_ports_/logger'
import { Sirens } from '@/core/siren/sirens'
import { AndroidSirenLookout } from '@core/_ports_/siren.lookout'

export class InMemorySirenLookout implements AndroidSirenLookout {
  sirens?: Sirens = undefined

  private listener?: (packageName: string) => void

  constructor(private readonly logger: Logger) {}

  watchSirens(sirens: Sirens): void {
    try {
      this.logger.info(
        `Looking out for sirens: ${sirens.android.map((app) => app.appName).join(', ')}`,
      )
      this.sirens = sirens
    } catch (error) {
      this.logger.error(`Failed to watch sirens: ${error}`)
      throw error
    }
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
    } catch (error) {
      this.logger.error(
        `Failed to check if accessibility service is enabled: ${error}`,
      )
      return false
    }
  }

  async askPermission(): Promise<void> {
    try {
      await AccessibilityService.askPermission()
    } catch (error) {
      this.logger.error(`Failed to ask for accessibility permission: ${error}`)
      throw error
    }
  }
}

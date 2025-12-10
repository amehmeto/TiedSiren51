import { Logger } from '@/core/_ports_/logger'
import { Sirens } from '@/core/siren/sirens'
import { AndroidSirenLookout } from '@core/_ports_/siren.lookout'

/**
 * In-memory implementation of SirenLookout for testing purposes.
 * Does not connect to the real AccessibilityService.
 */
export class InMemorySirenLookout implements AndroidSirenLookout {
  sirens?: Sirens = undefined

  private listener?: (packageName: string) => void

  private enabled = true

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

  stopWatching(): void {
    this.sirens = undefined
    this.logger.info('Stopped watching for sirens')
  }

  onSirenDetected(listener: (packageName: string) => void): void {
    this.listener = listener
  }

  // Test helper method to simulate detection
  simulateDetection(packageName: string): void {
    if (this.listener) this.listener(packageName)
  }

  async isEnabled(): Promise<boolean> {
    return this.enabled
  }

  async askPermission(): Promise<void> {
    this.enabled = true
  }

  // Test helper to set enabled state
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }
}

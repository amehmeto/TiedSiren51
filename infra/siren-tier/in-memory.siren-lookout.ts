import { Logger } from '@/core/_ports_/logger'
import { AndroidSirenLookout } from '@core/_ports_/siren.lookout'

/**
 * In-memory implementation of SirenLookout for testing purposes.
 * Does not connect to the real AccessibilityService.
 */
export class InMemorySirenLookout implements AndroidSirenLookout {
  private listener?: (packageName: string) => void

  private enabled = true

  private watching = false

  constructor(private readonly logger: Logger) {}

  startWatching(): void {
    this.watching = true
    this.logger.info('Started watching for app launches')
  }

  stopWatching(): void {
    this.watching = false
    this.logger.info('Stopped watching for app launches')
  }

  isWatching(): boolean {
    return this.watching
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

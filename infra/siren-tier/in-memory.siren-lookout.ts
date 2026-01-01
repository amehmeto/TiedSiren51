import { AndroidSirenLookout, DetectedSiren } from '@core/_ports_/siren.lookout'

/**
 * In-memory implementation of SirenLookout for testing purposes.
 * Does not connect to the real AccessibilityService.
 */
export class InMemorySirenLookout implements AndroidSirenLookout {
  private listener?: (siren: DetectedSiren) => void

  _isEnabled = true

  isWatching = false

  shouldThrowOnStart = false

  shouldThrowOnStop = false

  shouldThrowOnSync = false

  lastSyncedApps: string[] = []

  async initialize(): Promise<void> {
    // No-op for in-memory implementation
  }

  onSirenDetected(listener: (siren: DetectedSiren) => void): void {
    this.listener = listener
  }

  startWatching(): void {
    if (this.shouldThrowOnStart) throw new Error('Start watching failed')
    this.isWatching = true
  }

  stopWatching(): void {
    if (this.shouldThrowOnStop) throw new Error('Stop watching failed')
    this.isWatching = false
  }

  simulateDetection(packageName: string): void {
    if (this.listener) {
      this.listener({
        type: 'app',
        identifier: packageName,
        timestamp: Date.now(),
      })
    }
  }

  async isEnabled(): Promise<boolean> {
    return this._isEnabled
  }

  async askPermission(): Promise<void> {
    this._isEnabled = true
  }

  async updateBlockedApps(packageNames: string[]): Promise<void> {
    if (this.shouldThrowOnSync) throw new Error('Sync blocked apps failed')
    this.lastSyncedApps = packageNames
  }
}

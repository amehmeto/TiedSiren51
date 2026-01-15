import { AndroidSirenLookout, DetectedSiren } from '@core/_ports_/siren.lookout'

/**
 * In-memory implementation of SirenLookout for testing purposes.
 * Does not connect to the real AccessibilityService.
 */
export class InMemorySirenLookout implements AndroidSirenLookout {
  private listener?: (siren: DetectedSiren) => void

  _isEnabled = true

  isWatching = false

  startWatchingCallCount = 0

  stopWatchingCallCount = 0

  shouldThrowOnStart = false

  shouldThrowOnStop = false

  async initialize(): Promise<void> {
    // No-op for in-memory implementation
  }

  onSirenDetected(listener: (siren: DetectedSiren) => void): void {
    this.listener = listener
  }

  startWatching(): void {
    this.startWatchingCallCount++
    if (this.shouldThrowOnStart) throw new Error('Start watching failed')
    this.isWatching = true
  }

  stopWatching(): void {
    this.stopWatchingCallCount++
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
}

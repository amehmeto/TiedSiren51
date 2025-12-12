import { AndroidSirenLookout } from '@core/_ports_/siren.lookout'

export class InMemorySirenLookout implements AndroidSirenLookout {
  private listener?: (packageName: string) => void

  enabled = true

  watching = false

  shouldThrowOnStart = false

  shouldThrowOnStop = false

  startWatching(): void {
    if (this.shouldThrowOnStart) throw new Error('Start watching failed')
    this.watching = true
  }

  stopWatching(): void {
    if (this.shouldThrowOnStop) throw new Error('Stop watching failed')
    this.watching = false
  }

  onSirenDetected(listener: (packageName: string) => void): void {
    this.listener = listener
  }

  simulateDetection(packageName: string): void {
    if (this.listener) this.listener(packageName)
  }

  async isEnabled(): Promise<boolean> {
    return this.enabled
  }

  async askPermission(): Promise<void> {
    this.enabled = true
  }
}

import { AndroidSirenLookout } from '@core/_ports_/siren.lookout'

export class InMemorySirenLookout implements AndroidSirenLookout {
  private listener?: (packageName: string) => void

  enabled = true

  watching = false

  startWatching(): void {
    this.watching = true
  }

  stopWatching(): void {
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

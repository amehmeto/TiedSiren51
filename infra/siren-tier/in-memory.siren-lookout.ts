import { AndroidSirenLookout } from '@core/_ports_/siren.lookout'

export class InMemorySirenLookout implements AndroidSirenLookout {
  private listener?: (packageName: string) => void

  _isEnabled = true

  isWatching = false

  startWatching(): void {
    this.isWatching = true
  }

  stopWatching(): void {
    this.isWatching = false
  }

  onSirenDetected(listener: (packageName: string) => void): void {
    this.listener = listener
  }

  simulateDetection(packageName: string): void {
    if (this.listener) this.listener(packageName)
  }

  async isEnabled(): Promise<boolean> {
    return this._isEnabled
  }

  async askPermission(): Promise<void> {
    this._isEnabled = true
  }
}

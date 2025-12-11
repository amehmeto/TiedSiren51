import { AndroidSirenLookout } from '@/core/_ports_/siren.lookout'

export class FakeSirenLookout implements AndroidSirenLookout {
  private listener?: (packageName: string) => void

  private enabled = true

  private watching = false

  startWatching(): void {
    this.watching = true
  }

  stopWatching(): void {
    this.watching = false
  }

  onSirenDetected(listener: (packageName: string) => void): void {
    this.listener = listener
  }

  // Test helper method to simulate detection
  simulateDetection(packageName: string): void {
    if (this.listener) this.listener(packageName)
  }

  // Test helper to check if watching is active
  isWatching(): boolean {
    return this.watching
  }

  async isEnabled(): Promise<boolean> {
    return this.enabled
  }

  async askPermission(): Promise<void> {
    this.enabled = true
  }
}

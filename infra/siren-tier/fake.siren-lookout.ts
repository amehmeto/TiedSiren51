import { AndroidSirenLookout } from '@/core/_ports_/siren.lookout'
import { Sirens } from '@/core/siren/sirens'

export class FakeSirenLookout implements AndroidSirenLookout {
  sirens?: Sirens = undefined

  private listener?: (packageName: string) => void

  private enabled = true

  watchSirens(sirens: Sirens): void {
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
    return this.enabled
  }

  async askPermission(): Promise<void> {
    this.enabled = true
  }
}

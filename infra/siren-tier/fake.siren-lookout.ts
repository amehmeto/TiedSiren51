import { AndroidSirenLookout } from '@/core/_ports_/siren.lookout'
import { Sirens } from '@/core/siren/sirens'

export class FakeSirenLookout implements AndroidSirenLookout {
  sirens?: Sirens = undefined

  private enabled = true

  watchSirens(sirens: Sirens): void {
    this.sirens = sirens
  }

  async isEnabled(): Promise<boolean> {
    return this.enabled
  }

  async askPermission(): Promise<void> {
    this.enabled = true
  }
}

import { OrphanClaimFlagStorage } from '@/core/_ports_/orphan-claim-flag.storage'

export class InMemoryOrphanClaimFlagStorage implements OrphanClaimFlagStorage {
  private hasClaimedFlag = false

  async hasClaimed(): Promise<boolean> {
    return this.hasClaimedFlag
  }

  async markClaimed(): Promise<void> {
    this.hasClaimedFlag = true
  }
}

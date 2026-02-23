/**
 * Tracks whether the one-time PowerSync orphan-claim migration has run.
 * Used to avoid running claimOrphanedRows on every login after initial migration.
 */
export interface OrphanClaimFlagStorage {
  hasClaimed(): Promise<boolean>
  markClaimed(): Promise<void>
}

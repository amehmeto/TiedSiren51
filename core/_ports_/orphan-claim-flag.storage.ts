/**
 * Port for persisting whether the one-time PowerSync orphan-claim has run.
 *
 * Domain need: after login we may run claimOrphanedRows (assign unclaimed rows to
 * the current user). We only want to do that once per device, not on every login.
 * The domain depends on a simple capability: "has this run?" and "mark as run";
 * where and how that is stored (AsyncStorage, SQLite, etc.) is an implementation
 * detail behind this port.
 */
export interface OrphanClaimFlagStorage {
  hasClaimed(): Promise<boolean>
  markClaimed(): Promise<void>
}

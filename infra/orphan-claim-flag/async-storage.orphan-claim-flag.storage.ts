import AsyncStorage from '@react-native-async-storage/async-storage'
import { Logger } from '@/core/_ports_/logger'
import { OrphanClaimFlagStorage } from '@/core/_ports_/orphan-claim-flag.storage'

/**
 * Persists the "orphan claim done" flag in AsyncStorage so we only run
 * claimOrphanedRows once per device. Needed because PowerSync rows created
 * before login have user_id = NULL; after first login we claim them and then
 * must not claim again on subsequent logins.
 */
export class AsyncStorageOrphanClaimFlagStorage implements OrphanClaimFlagStorage {
  private static readonly STORAGE_KEY = 'powersync_orphan_claim_done'

  constructor(private readonly logger: Logger) {}

  async hasClaimed(): Promise<boolean> {
    try {
      const storageKey = AsyncStorageOrphanClaimFlagStorage.STORAGE_KEY
      const value = await AsyncStorage.getItem(storageKey)
      return value === 'true'
    } catch (error) {
      this.logger.error(
        `[AsyncStorageOrphanClaimFlagStorage] Failed to hasClaimed: ${error}`,
      )
      return false
    }
  }

  async markClaimed(): Promise<void> {
    try {
      const storageKey = AsyncStorageOrphanClaimFlagStorage.STORAGE_KEY
      await AsyncStorage.setItem(storageKey, 'true')
    } catch (error) {
      this.logger.error(
        `[AsyncStorageOrphanClaimFlagStorage] Failed to markClaimed: ${error}`,
      )
      throw error
    }
  }
}

import { DateProvider } from '@/core/_ports_/date-provider'
import { ForegroundService } from '@/core/_ports_/foreground.service'
import { Logger } from '@/core/_ports_/logger'
import { SirenLookout } from '@/core/_ports_/siren.lookout'
import { AppStore } from '@/core/_redux_/createStore'
import { selectAllBlockSessions } from '@/core/block-session/selectors/selectAllBlockSessions'
import { selectBlockedPackages } from '@/core/siren/selectors/selectBlockedPackages'

/**
 * Listens to block session changes and starts/stops the siren lookout accordingly.
 *
 * - When there are block sessions (active or scheduled): starts foreground service then watching
 * - When there are no block sessions: stops watching then foreground service
 *
 * Also syncs blocked apps to native SharedPreferences for native-to-native blocking:
 * - On protection start: syncs package names from active sessions
 * - On protection stop: clears blocked apps
 * - On blocklist changes during active session: re-syncs
 *
 * The foreground service keeps the app alive in the background via a persistent notification.
 * This ensures the AccessibilityService subscription receives events even when app is backgrounded.
 *
 * Note: The lookout only detects app launches. The actual filtering of which apps
 * to block happens in the blockLaunchedApp usecase via selectTargetedApps selector.
 *
 * Note: Async operations (foreground service, blocked apps sync) are fire-and-forget
 * with errors caught and logged in their respective safe* wrapper functions.
 */
export const onBlockSessionsChangedListener = ({
  store,
  sirenLookout,
  foregroundService,
  dateProvider,
  logger,
}: {
  store: AppStore
  sirenLookout: SirenLookout
  foregroundService: ForegroundService
  dateProvider: DateProvider
  logger: Logger
}): (() => void) => {
  const safeStartForegroundService = async () => {
    try {
      await foregroundService.start()
    } catch (error) {
      logger.error(`Failed to start foreground service: ${error}`)
    }
  }

  const safeStopForegroundService = async () => {
    try {
      await foregroundService.stop()
    } catch (error) {
      logger.error(`Failed to stop foreground service: ${error}`)
    }
  }

  const safeStartWatching = () => {
    try {
      sirenLookout.startWatching()
    } catch (error) {
      logger.error(`Failed to start watching: ${error}`)
    }
  }

  const safeStopWatching = () => {
    try {
      sirenLookout.stopWatching()
    } catch (error) {
      logger.error(`Failed to stop watching: ${error}`)
    }
  }

  const safeSyncBlockedApps = async (packageNames: string[]) => {
    try {
      await sirenLookout.updateBlockedApps(packageNames)
    } catch (error) {
      logger.error(`Failed to sync blocked apps: ${error}`)
    }
  }

  const startProtection = async (blockedPackages: string[]) => {
    await safeSyncBlockedApps(blockedPackages)
    void safeStartForegroundService()
    safeStartWatching()
  }

  const stopProtection = async () => {
    await safeSyncBlockedApps([])
    safeStopWatching()
    void safeStopForegroundService()
  }

  // Check initial state
  const initialState = store.getState()
  const initialSessions = selectAllBlockSessions(initialState.blockSession)
  let didHaveSessions = initialSessions.length > 0
  let lastSyncedPackages: string[] = []

  if (didHaveSessions) {
    const blockedPackages = selectBlockedPackages(initialState, dateProvider)
    lastSyncedPackages = blockedPackages
    void startProtection(blockedPackages)
  }

  // Subscribe to store changes
  return store.subscribe(() => {
    const state = store.getState()
    const sessions = selectAllBlockSessions(state.blockSession)
    const hasSessions = sessions.length > 0

    if (didHaveSessions && !hasSessions) {
      void stopProtection()
      lastSyncedPackages = []
    } else if (!didHaveSessions && hasSessions) {
      const blockedPackages = selectBlockedPackages(state, dateProvider)
      lastSyncedPackages = blockedPackages
      void startProtection(blockedPackages)
    } else if (hasSessions) {
      // Sessions still exist - check if blocked apps changed (O(n) with Set)
      const blockedPackages = selectBlockedPackages(state, dateProvider)
      const lastSyncedSet = new Set(lastSyncedPackages)
      const hasPackagesChanged =
        blockedPackages.length !== lastSyncedPackages.length ||
        blockedPackages.some((pkg) => !lastSyncedSet.has(pkg))

      if (hasPackagesChanged) {
        lastSyncedPackages = blockedPackages
        void safeSyncBlockedApps(blockedPackages)
      }
    }

    didHaveSessions = hasSessions
  })
}

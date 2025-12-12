import { ForegroundService } from '@/core/_ports_/foreground.service'
import { Logger } from '@/core/_ports_/logger'
import { SirenLookout } from '@/core/_ports_/siren.lookout'
import { AppStore } from '@/core/_redux_/createStore'
import { selectAllBlockSessions } from '@/core/block-session/selectors/selectAllBlockSessions'

/**
 * Listens to block session changes and starts/stops the siren lookout accordingly.
 *
 * - When there are block sessions (active or scheduled): starts foreground service then watching
 * - When there are no block sessions: stops watching then foreground service
 *
 * The foreground service keeps the app alive in the background via a persistent notification.
 * This ensures the AccessibilityService subscription receives events even when app is backgrounded.
 *
 * Note: The lookout only detects app launches. The actual filtering of which apps
 * to block happens in the blockLaunchedApp usecase via selectTargetedApps selector.
 */
export const onBlockSessionsChangedListener = ({
  store,
  sirenLookout,
  foregroundService,
  logger,
}: {
  store: AppStore
  sirenLookout: SirenLookout
  foregroundService: ForegroundService
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

  const startProtection = () => {
    void safeStartForegroundService()
    safeStartWatching()
  }

  const stopProtection = () => {
    safeStopWatching()
    void safeStopForegroundService()
  }

  // Check initial state
  const initialState = store.getState()
  const initialSessions = selectAllBlockSessions(initialState.blockSession)
  let previousHadSessions = initialSessions.length > 0

  if (previousHadSessions) startProtection()

  // Subscribe to store changes
  return store.subscribe(() => {
    const state = store.getState()
    const sessions = selectAllBlockSessions(state.blockSession)
    const hasSessions = sessions.length > 0

    if (previousHadSessions && !hasSessions) stopProtection()
    else if (!previousHadSessions && hasSessions) startProtection()

    previousHadSessions = hasSessions
  })
}

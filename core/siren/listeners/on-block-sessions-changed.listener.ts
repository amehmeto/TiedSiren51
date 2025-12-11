import { Logger } from '@/core/_ports_/logger'
import { SirenLookout } from '@/core/_ports_/siren.lookout'
import { AppStore } from '@/core/_redux_/createStore'
import { selectAllBlockSessions } from '@/core/block-session/selectors/selectAllBlockSessions'

/**
 * Listens to block session changes and starts/stops the siren lookout accordingly.
 *
 * - When there are block sessions (active or scheduled): starts watching
 * - When there are no block sessions: stops watching
 *
 * This ensures the AccessibilityService subscription is only active when needed,
 * avoiding the persistent notification icon when there's nothing to block.
 *
 * Note: The lookout only detects app launches. The actual filtering of which apps
 * to block happens in the blockLaunchedApp usecase via selectTargetedApps selector.
 */
export const onBlockSessionsChangedListener = ({
  store,
  sirenLookout,
  logger,
}: {
  store: AppStore
  sirenLookout: SirenLookout
  logger: Logger
}): (() => void) => {
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

  // Check initial state
  const initialState = store.getState()
  const initialSessions = selectAllBlockSessions(initialState.blockSession)
  let previousHadSessions = initialSessions.length > 0

  if (previousHadSessions) safeStartWatching()

  // Subscribe to store changes
  return store.subscribe(() => {
    const state = store.getState()
    const sessions = selectAllBlockSessions(state.blockSession)
    const hasSessions = sessions.length > 0

    if (previousHadSessions && !hasSessions) safeStopWatching()
    else if (!previousHadSessions && hasSessions) safeStartWatching()

    previousHadSessions = hasSessions
  })
}

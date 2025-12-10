import { SirenLookout } from '@/core/_ports_/siren.lookout'
import { AppStore } from '@/core/_redux_/createStore'
import { selectAllBlockSessions } from '@/core/block-session/selectors/selectAllBlockSessions'
import { Sirens } from '@/core/siren/sirens'

/**
 * Listens to block session changes and starts/stops the siren lookout accordingly.
 *
 * - When there are block sessions (active or scheduled): starts watching
 * - When there are no block sessions: stops watching
 *
 * This ensures the AccessibilityService subscription is only active when needed,
 * avoiding the persistent notification icon when there's nothing to block.
 */
export const onBlockSessionsChangedListener = ({
  store,
  sirenLookout,
}: {
  store: AppStore
  sirenLookout: SirenLookout
}) => {
  let previousSessionCount = 0

  // Check initial state
  const initialState = store.getState()
  const initialSessions = selectAllBlockSessions(initialState.blockSession)

  if (initialSessions.length > 0) {
    const sirens = extractSirensFromSessions(initialSessions)
    sirenLookout.watchSirens(sirens)
    previousSessionCount = initialSessions.length
  }

  // Subscribe to store changes
  store.subscribe(() => {
    const state = store.getState()
    const sessions = selectAllBlockSessions(state.blockSession)
    const currentSessionCount = sessions.length

    // Only react when session count changes from 0 to >0 or vice versa
    const hadSessions = previousSessionCount > 0
    const hasSessions = currentSessionCount > 0

    if (hadSessions && !hasSessions) {
      // All sessions removed: stop watching
      sirenLookout.stopWatching()
    } else if (hasSessions && currentSessionCount !== previousSessionCount) {
      // Sessions added or changed: update the watched sirens
      const sirens = extractSirensFromSessions(sessions)
      sirenLookout.watchSirens(sirens)
    }

    previousSessionCount = currentSessionCount
  })
}

function extractSirensFromSessions(
  sessions: ReturnType<typeof selectAllBlockSessions>,
): Sirens {
  const androidApps = sessions.flatMap((session) =>
    session.blocklists.flatMap((blocklist) => blocklist.sirens.android),
  )

  return {
    android: androidApps,
    ios: [],
    windows: [],
    macos: [],
    linux: [],
    websites: [],
    keywords: [],
  }
}

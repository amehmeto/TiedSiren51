import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '@/core/_redux_/createStore'
import { selectActiveSessions } from '@/core/block-session/selectors/selectActiveSessions'
import { blocklistAdapter } from '@/core/blocklist/blocklist'
import { AndroidSiren } from '../sirens'

/**
 * @deprecated This selector was designed for the JS-side app blocking path which has been
 * superseded by native blocking. The native path (AccessibilityService → BlockingCallback →
 * SharedPreferences → showOverlay) handles blocking without JS involvement.
 *
 * Kept for potential future UI display needs (e.g., showing currently blocked apps).
 *
 * @see docs/tech-debt/native-siren-filtering.md for architecture context
 */
export const selectTargetedApps = createSelector(
  [
    (state: RootState) => state.blockSession,
    (state: RootState) => state.blocklist,
    (_state: RootState, dateProvider) => dateProvider,
  ],
  (blockSessionState, blocklistState, dateProvider): AndroidSiren[] => {
    const activeSessions = selectActiveSessions(dateProvider, blockSessionState)
    const blocklists = blocklistAdapter
      .getSelectors()
      .selectEntities(blocklistState)

    return activeSessions.flatMap((blockSession) =>
      blockSession.blocklistIds
        .flatMap((id) => (id in blocklists ? [blocklists[id]] : []))
        .flatMap((blocklist) => blocklist.sirens.android),
    )
  },
)

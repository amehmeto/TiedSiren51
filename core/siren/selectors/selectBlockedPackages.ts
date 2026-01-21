import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '@/core/_redux_/createStore'
import { selectActiveSessions } from '@/core/block-session/selectors/selectActiveSessions'
import { blocklistAdapter } from '@/core/blocklist/blocklist'

export const selectBlockedPackages = createSelector(
  [
    (state: RootState) => state.blockSession,
    (state: RootState) => state.blocklist,
    (_state: RootState, dateProvider) => dateProvider,
  ],
  (blockSessionState, blocklistState, dateProvider): string[] => {
    const activeSessions = selectActiveSessions(dateProvider, blockSessionState)
    const blocklists = blocklistAdapter
      .getSelectors()
      .selectEntities(blocklistState)

    const allPackages = activeSessions.flatMap((session) =>
      session.blocklistIds
        .flatMap((id) => (id in blocklists ? [blocklists[id]] : []))
        .flatMap((blocklist) => blocklist.sirens.android)
        .map((siren) => siren.packageName),
    )

    return [...new Set(allPackages)]
  },
)

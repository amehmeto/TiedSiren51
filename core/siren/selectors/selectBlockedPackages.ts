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
    const packages = new Set<string>()

    for (const session of activeSessions) {
      for (const blocklistId of session.blocklistIds) {
        if (!(blocklistId in blocklists)) continue
        const blocklist = blocklists[blocklistId]
        for (const siren of blocklist.sirens.android)
          packages.add(siren.packageName)
      }
    }

    return Array.from(packages)
  },
)

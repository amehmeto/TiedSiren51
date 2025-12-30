import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '@/core/_redux_/createStore'
import { selectActiveSessions } from '@/core/block-session/selectors/selectActiveSessions'

export const selectBlockedPackages = createSelector(
  [
    (state: RootState) => state.blockSession,
    (_state: RootState, dateProvider) => dateProvider,
  ],
  (blockSessionState, dateProvider): string[] => {
    const activeSessions = selectActiveSessions(dateProvider, blockSessionState)
    const packages = new Set<string>()

    for (const session of activeSessions) {
      for (const blocklist of session.blocklists) {
        for (const siren of blocklist.sirens.android)
          packages.add(siren.packageName)
      }
    }

    return Array.from(packages)
  },
)

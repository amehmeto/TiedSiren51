import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '@/core/_redux_/createStore'
import { selectActiveSessions } from '@/core/block-session/selectors/selectActiveSessions'
import { AndroidSiren } from '../sirens'

export const selectTargetedApps = createSelector(
  [
    (state: RootState) => state.blockSession,
    (_state: RootState, dateProvider) => dateProvider,
  ],
  (blockSessionState, dateProvider): AndroidSiren[] => {
    const activeSessions = selectActiveSessions(dateProvider, blockSessionState)

    const targetedApps: AndroidSiren[] = activeSessions.flatMap(
      (blockSession) =>
        blockSession.blocklists.flatMap(
          (blocklist) => blocklist.sirens.android,
        ),
    )

    return targetedApps
  },
)

import { createSelector } from '@reduxjs/toolkit'
import { DateProvider } from '@/core/_ports_/date-provider'
import { RootState } from '@/core/_redux_/createStore'
import { blockSessionAdapter } from '@/core/block-session/block-session'
import { isActive } from './isActive'

export const selectHasActiveSession = createSelector(
  [
    (dateProvider: DateProvider) => dateProvider,
    (_: DateProvider, state: RootState) => state.blockSession,
  ],
  (dateProvider, blockSessionState): boolean => {
    if (blockSessionState.ids.length === 0) return false

    const allSessions = blockSessionAdapter
      .getSelectors()
      .selectAll(blockSessionState)

    return allSessions.some((session) => isActive(dateProvider, session))
  },
)

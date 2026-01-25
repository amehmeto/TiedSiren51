import { createSelector } from '@reduxjs/toolkit'
import { mergeSirens } from '@/core/__utils__/siren-merge.utils'
import { DateProvider } from '@/core/_ports_/date-provider'
import { BlockingSchedule } from '@/core/_ports_/siren.tier'
import { RootState } from '@/core/_redux_/createStore'
import { blockSessionAdapter } from '@/core/block-session/block-session'
import { blocklistAdapter } from '@/core/blocklist/blocklist'

export const selectBlockingSchedule = createSelector(
  [
    (dateProvider: DateProvider) => dateProvider,
    (_: DateProvider, state: RootState) => state.blockSession,
    (_: DateProvider, state: RootState) => state.blocklist,
  ],
  (dateProvider, blockSessionState, blocklistState): BlockingSchedule[] => {
    if (blockSessionState.ids.length === 0) return []

    const allSessions = blockSessionAdapter
      .getSelectors()
      .selectAll(blockSessionState)

    const blocklists = blocklistAdapter
      .getSelectors()
      .selectEntities(blocklistState)

    return allSessions.map((session) => {
      const startDate = dateProvider.recoverDate(session.startedAt)
      const endDate = dateProvider.recoverDate(session.endedAt)
      const sirens = mergeSirens(
        session.blocklistIds
          .flatMap((id) => (id in blocklists ? [blocklists[id]] : []))
          .map((bl) => bl.sirens),
      )

      return {
        id: session.id,
        startTime: dateProvider.toISOString(startDate),
        endTime: dateProvider.toISOString(endDate),
        sirens,
      }
    })
  },
)

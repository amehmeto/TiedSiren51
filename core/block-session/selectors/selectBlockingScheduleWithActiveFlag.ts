import { createSelector } from '@reduxjs/toolkit'
import { mergeSirens } from '@/core/__utils__/siren-merge.utils'
import { DateProvider } from '@/core/_ports_/date-provider'
import { BlockingSchedule } from '@/core/_ports_/siren.tier'
import { RootState } from '@/core/_redux_/createStore'
import { blockSessionAdapter } from '@/core/block-session/block-session'
import { blocklistAdapter } from '@/core/blocklist/blocklist'
import { isActive } from './isActive'

export type BlockingScheduleWithActiveFlag = {
  schedule: BlockingSchedule[]
  hasActiveSession: boolean
}

/**
 * Selects all block sessions as BlockingSchedule[] and whether any session is active NOW.
 * Combines schedule selection with active check in a single iteration for performance.
 * - schedule: All sessions (active + scheduled) for native layer to handle time windows
 * - hasActiveSession: Whether any session is currently active (for foreground service lifecycle)
 */
export const selectBlockingScheduleWithActiveFlag = createSelector(
  [
    (dateProvider: DateProvider) => dateProvider,
    (_: DateProvider, state: RootState) => state.blockSession,
    (_: DateProvider, state: RootState) => state.blocklist,
  ],
  (
    dateProvider,
    blockSessionState,
    blocklistState,
  ): BlockingScheduleWithActiveFlag => {
    if (blockSessionState.ids.length === 0)
      return { schedule: [], hasActiveSession: false }

    const allSessions = blockSessionAdapter
      .getSelectors()
      .selectAll(blockSessionState)

    const blocklists = blocklistAdapter
      .getSelectors()
      .selectEntities(blocklistState)

    let hasActiveSession = false

    const schedule = allSessions.map((session) => {
      if (!hasActiveSession && isActive(dateProvider, session))
        hasActiveSession = true

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

    return { schedule, hasActiveSession }
  },
)

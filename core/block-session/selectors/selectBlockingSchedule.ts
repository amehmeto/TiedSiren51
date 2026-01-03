import { createSelector } from '@reduxjs/toolkit'
import { DateProvider } from '@/core/_ports_/date-provider'
import { BlockingSchedule } from '@/core/_ports_/siren.tier'
import { RootState } from '@/core/_redux_/createStore'
import { blockSessionAdapter } from '@/core/block-session/block-session'
import { blocklistAdapter } from '@/core/blocklist/blocklist'
import { Sirens } from '@/core/siren/sirens'
import { isActive } from './isActive'

const uniqueBy = <T, K>(array: T[], keyExtractor: (item: T) => K): T[] => {
  return [...new Map(array.map((item) => [keyExtractor(item), item])).values()]
}

const mergeSirens = (sirensArray: Sirens[]): Sirens => {
  const merge = <T, K>(extract: (s: Sirens) => T[], key: (item: T) => K) =>
    uniqueBy(sirensArray.flatMap(extract), key)

  return {
    android: merge(
      (s) => s.android,
      (app) => app.packageName,
    ),
    windows: merge(
      (s) => s.windows,
      (s) => s,
    ),
    macos: merge(
      (s) => s.macos,
      (s) => s,
    ),
    ios: merge(
      (s) => s.ios,
      (s) => s,
    ),
    linux: merge(
      (s) => s.linux,
      (s) => s,
    ),
    websites: merge(
      (s) => s.websites,
      (s) => s,
    ),
    keywords: merge(
      (s) => s.keywords,
      (s) => s,
    ),
  }
}

/**
 * Selects the blocking schedule by joining active sessions with fresh blocklist data.
 *
 * This selector is memoized with createSelector for performance optimization.
 * It will only recompute when dateProvider or state change.
 *
 * This selector:
 * 1. Gets all active block sessions
 * 2. Joins embedded blocklist IDs with current blocklist state (fresh data)
 * 3. Creates BlockingSchedule objects with time ranges and deduplicated sirens
 * 4. Falls back to embedded blocklist data if blocklist was deleted
 *
 * @param dateProvider - Provider for current date/time
 * @param state - Root state
 * @returns BlockingSchedule[] with each schedule containing id, startTime, endTime, and sirens
 */
export const selectBlockingSchedule = createSelector(
  [
    (dateProvider: DateProvider) => dateProvider,
    (_: DateProvider, state: RootState) => state.blockSession,
    (_: DateProvider, state: RootState) => state.blocklist,
  ],
  (dateProvider, blockSessionState, blocklistState): BlockingSchedule[] => {
    const activeSessions = blockSessionAdapter
      .getSelectors()
      .selectAll(blockSessionState)
      .filter((session) => isActive(dateProvider, session))

    const blocklistEntities = blocklistAdapter
      .getSelectors()
      .selectEntities(blocklistState)

    return activeSessions.map((session) => {
      // Join with fresh blocklist data, fallback to embedded if deleted
      const freshBlocklists = session.blocklists.map(
        (embedded) => blocklistEntities[embedded.id] ?? embedded,
      )

      const schedule: BlockingSchedule = {
        id: session.id,
        startTime: dateProvider.toISOString(
          dateProvider.recoverDate(session.startedAt),
        ),
        endTime: dateProvider.toISOString(
          dateProvider.recoverDate(session.endedAt),
        ),
        sirens: mergeSirens(freshBlocklists.map((bl) => bl.sirens)),
      }
      return schedule
    })
  },
)

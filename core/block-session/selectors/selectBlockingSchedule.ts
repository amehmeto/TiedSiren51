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

export const selectBlockingSchedule = createSelector(
  [
    (dateProvider: DateProvider) => dateProvider,
    (_: DateProvider, state: RootState) => state.blockSession,
    (_: DateProvider, state: RootState) => state.blocklist,
  ],
  (dateProvider, blockSessionState, blocklistState): BlockingSchedule[] => {
    if (blockSessionState.ids.length === 0) return []

    const activeSessions = blockSessionAdapter
      .getSelectors()
      .selectAll(blockSessionState)
      .filter((session) => isActive(dateProvider, session))

    if (activeSessions.length === 0) return []

    const blocklists = blocklistAdapter
      .getSelectors()
      .selectEntities(blocklistState)

    return activeSessions.map((session) => {
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

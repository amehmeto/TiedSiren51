import { EntityState } from '@reduxjs/toolkit'
import { DateProvider } from '@/core/_ports_/date-provider'
import { BlockingSchedule } from '@/core/_ports_/siren.tier'
import {
  BlockSession,
  blockSessionAdapter,
} from '@/core/block-session/block-session'
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

export const selectBlockingSchedule = (
  dateProvider: DateProvider,
  blockSession: EntityState<BlockSession, string>,
): BlockingSchedule[] => {
  const activeSessions = blockSessionAdapter
    .getSelectors()
    .selectAll(blockSession)
    .filter((session) => isActive(dateProvider, session))

  return activeSessions.map((session) => {
    const schedule: BlockingSchedule = {
      id: session.id,
      startTime: dateProvider.toISOString(
        dateProvider.recoverDate(session.startedAt),
      ),
      endTime: dateProvider.toISOString(
        dateProvider.recoverDate(session.endedAt),
      ),
      sirens: mergeSirens(session.blocklists.map((bl) => bl.sirens)),
    }
    return schedule
  })
}

import { EntityState } from '@reduxjs/toolkit'
import { DateProvider } from '@/core/_ports_/date-provider'
import { BlockingSchedule } from '@/core/_ports_/siren.tier'
import {
  BlockSession,
  blockSessionAdapter,
} from '@/core/block-session/block-session'
import { Sirens } from '@/core/siren/sirens'
import { isActive } from './isActive'

const emptySirens: Sirens = {
  android: [],
  windows: [],
  macos: [],
  ios: [],
  linux: [],
  websites: [],
  keywords: [],
}

const deduplicateSirens = (sirens: Sirens): Sirens => {
  const uniqueAndroid = [
    ...new Map(sirens.android.map((app) => [app.packageName, app])).values(),
  ]

  return {
    android: uniqueAndroid,
    windows: [...new Set(sirens.windows)],
    macos: [...new Set(sirens.macos)],
    ios: [...new Set(sirens.ios)],
    linux: [...new Set(sirens.linux)],
    websites: [...new Set(sirens.websites)],
    keywords: [...new Set(sirens.keywords)],
  }
}

const mergeSirens = (sirensArray: Sirens[]): Sirens => {
  const merged = sirensArray.reduce((acc, sirens) => {
    return {
      android: [...acc.android, ...sirens.android],
      windows: [...acc.windows, ...sirens.windows],
      macos: [...acc.macos, ...sirens.macos],
      ios: [...acc.ios, ...sirens.ios],
      linux: [...acc.linux, ...sirens.linux],
      websites: [...acc.websites, ...sirens.websites],
      keywords: [...acc.keywords, ...sirens.keywords],
    }
  }, emptySirens)

  return deduplicateSirens(merged)
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

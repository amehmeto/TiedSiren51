import { DateProvider } from '@/core/_ports_/date-provider'
import { RootState } from '@/core/_redux_/createStore'
import { selectActiveSessions } from '@/core/block-session/selectors/selectActiveSessions'
import { selectScheduledSessions } from '@/core/block-session/selectors/selectScheduledSessions'
import { selectBlocklistById } from '@/core/blocklist/selectors/selectBlocklistById'
import { Sirens } from '@/core/siren/sirens'
import { selectIsStrictModeActive } from './selectIsStrictModeActive'

export type LockedSirens = {
  android: Set<string>
  websites: Set<string>
  keywords: Set<string>
}

const EMPTY_LOCKED_SIRENS: LockedSirens = {
  android: new Set(),
  websites: new Set(),
  keywords: new Set(),
}

export function selectLockedSirensForBlocklist(
  state: RootState,
  dateProvider: DateProvider,
  blocklistId: string,
): LockedSirens {
  if (!selectIsStrictModeActive(state, dateProvider)) return EMPTY_LOCKED_SIRENS

  const allRelevantSessions = [
    ...selectActiveSessions(state, dateProvider),
    ...selectScheduledSessions(state, dateProvider),
  ]

  const isBlocklistInUse = allRelevantSessions.some((session) =>
    session.blocklistIds.includes(blocklistId),
  )
  if (!isBlocklistInUse) return EMPTY_LOCKED_SIRENS

  const blocklist = selectBlocklistById(state, blocklistId)

  return {
    android: new Set(blocklist.sirens.android.map((app) => app.packageName)),
    websites: new Set(blocklist.sirens.websites),
    keywords: new Set(blocklist.sirens.keywords),
  }
}

export function isSirenLocked(
  lockedSirens: LockedSirens,
  sirenType: keyof Sirens,
  sirenId: string,
): boolean {
  if (sirenType === 'android') return lockedSirens.android.has(sirenId)
  if (sirenType === 'websites') return lockedSirens.websites.has(sirenId)
  if (sirenType === 'keywords') return lockedSirens.keywords.has(sirenId)
  return false
}

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

const sirenLookup: Partial<
  Record<keyof Sirens, (lockedSirens: LockedSirens) => Set<string>>
> = {
  android: (lockedSirens) => lockedSirens.android,
  websites: (lockedSirens) => lockedSirens.websites,
  keywords: (lockedSirens) => lockedSirens.keywords,
}

export function isSirenLocked(
  lockedSirens: LockedSirens,
  sirenType: keyof Sirens,
  sirenId: string,
): boolean {
  const lookup = sirenLookup[sirenType]
  return lookup ? lookup(lockedSirens).has(sirenId) : false
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

  const {
    sirens: { android, websites, keywords },
  } = selectBlocklistById(state, blocklistId)

  return {
    android: new Set(android.map((app) => app.packageName)),
    websites: new Set(websites),
    keywords: new Set(keywords),
  }
}

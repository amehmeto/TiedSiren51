import { DateProvider } from '@/core/_ports_/date-provider'
import { RootState } from '@/core/_redux_/createStore'
import { selectActiveSessions } from '@/core/block-session/selectors/selectActiveSessions'
import { selectScheduledSessions } from '@/core/block-session/selectors/selectScheduledSessions'
import { selectBlocklistById } from '@/core/blocklist/selectors/selectBlocklistById'
import { LockedSirens } from '@/core/strict-mode/is-siren-locked'
import { selectIsStrictModeActive } from './selectIsStrictModeActive'

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

  const {
    sirens: { android, websites, keywords },
  } = selectBlocklistById(state, blocklistId)

  return {
    android: new Set(android.map((app) => app.packageName)),
    websites: new Set(websites),
    keywords: new Set(keywords),
  }
}

import { DateProvider } from '@/core/_ports_/date-provider'
import { RootState } from '@/core/_redux_/createStore'
import { selectActiveSessions } from './selectActiveSessions'
import { selectScheduledSessions } from './selectScheduledSessions'

export const selectLockedBlocklistIds = (
  state: RootState,
  dateProvider: DateProvider,
): string[] => {
  const allSessions = [
    ...selectActiveSessions(state, dateProvider),
    ...selectScheduledSessions(state, dateProvider),
  ]
  const blocklistIds = allSessions.flatMap((session) => session.blocklistIds)

  return [...new Set(blocklistIds)]
}

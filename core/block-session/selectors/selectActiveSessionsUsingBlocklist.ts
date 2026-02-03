import { DateProvider } from '@/core/_ports_/date-provider'
import { RootState } from '@/core/_redux_/createStore'
import { BlockSession } from '@/core/block-session/block-session'
import { selectActiveSessions } from './selectActiveSessions'

export const selectActiveSessionsUsingBlocklist = (
  state: RootState,
  dateProvider: DateProvider,
  blocklistId: string,
): BlockSession[] => {
  const activeSessions = selectActiveSessions(state, dateProvider)
  return activeSessions.filter((session) =>
    session.blocklistIds.includes(blocklistId),
  )
}

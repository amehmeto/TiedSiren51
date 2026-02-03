import { DateProvider } from '@/core/_ports_/date-provider'
import { RootState } from '@/core/_redux_/createStore'
import { BlockSession } from '@/core/block-session/block-session'
import { selectActiveSessions } from './selectActiveSessions'

export const selectActiveSessionsUsingBlocklist = (
  dateProvider: DateProvider,
  state: RootState,
  blocklistId: string,
): BlockSession[] => {
  const activeSessions = selectActiveSessions(dateProvider, state.blockSession)
  return activeSessions.filter((session) =>
    session.blocklistIds.includes(blocklistId),
  )
}

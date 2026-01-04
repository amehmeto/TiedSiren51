import { EntityState } from '@reduxjs/toolkit'
import { DateProvider } from '@/core/_ports_/date-provider'
import { BlockSession } from '@/core/block-session/block-session'
import { selectActiveSessions } from './selectActiveSessions'

export const selectActiveSessionsUsingBlocklist = (
  dateProvider: DateProvider,
  blockSession: EntityState<BlockSession, string>,
  blocklistId: string,
): BlockSession[] => {
  const activeSessions = selectActiveSessions(dateProvider, blockSession)
  return activeSessions.filter((session) =>
    session.blocklists.some((blocklist) => blocklist.id === blocklistId),
  )
}

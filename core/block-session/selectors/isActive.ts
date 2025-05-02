import { DateProvider } from '../../ports/port.date-provider'
import { BlockSession } from '../block.session'
import { isBefore } from 'date-fns'

export function isActive(dateProvider: DateProvider, session: BlockSession) {
  const now = dateProvider.getNow()
  const nowHHmm = dateProvider.toHHmm(now)
  const isOvernight = session.startedAt > session.endedAt

  if (isOvernight) {
    // For overnight sessions, we need to handle two cases:
    // 1. Current time is after start time but before midnight
    // 2. Current time is after midnight but before end time
    if (nowHHmm >= session.startedAt || nowHHmm < session.endedAt) {
      return true
    }
    return false
  } else {
    // Regular session (start and end on same day)
    const start = dateProvider.recoverDate(session.startedAt)
    const end = dateProvider.recoverDate(session.endedAt)
    return !isBefore(now, start) && isBefore(now, end)
  }
}

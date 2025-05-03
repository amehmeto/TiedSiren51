import { DateProvider } from '../../ports/port.date-provider'
import { BlockSession } from '../block.session'
import { isBefore } from 'date-fns'

export function isActive(dateProvider: DateProvider, session: BlockSession) {
  const now = dateProvider.getNow()
  const nowHHmm = dateProvider.toHHmm(now)
  const isOvernight = session.startedAt > session.endedAt

  // For overnight sessions, use HH:MM string comparison
  // If current time is after start OR before end, it's active
  const isActiveOvernight =
    isOvernight && (nowHHmm >= session.startedAt || nowHHmm < session.endedAt)

  // For regular sessions, use date comparison
  const start = dateProvider.recoverDate(session.startedAt)
  const end = dateProvider.recoverDate(session.endedAt)
  const isActiveRegular =
    !isOvernight && !isBefore(now, start) && isBefore(now, end)

  return isActiveOvernight || isActiveRegular
}

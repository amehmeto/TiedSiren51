import { DateProvider } from '../../ports/port.date-provider'
import { BlockSession } from '../block.session'
import { isBefore } from 'date-fns'

export function isActive(dateProvider: DateProvider, session: BlockSession) {
  const now = dateProvider.getNow()
  const nowHHmm = dateProvider.toHHmm(now)
  const isOvernight = session.startedAt > session.endedAt

  const isActiveOvernight =
    isOvernight && (nowHHmm >= session.startedAt || nowHHmm < session.endedAt)

  const start = dateProvider.recoverDate(session.startedAt)
  const end = dateProvider.recoverDate(session.endedAt)
  const isActiveRegular =
    !isOvernight && !isBefore(now, start) && isBefore(now, end)

  return isActiveOvernight || isActiveRegular
}

import { DateProvider } from '@/core/_ports_/port.date-provider'
import { RootState } from '@/core/_redux_/createStore'
import { TimeLeft } from '../timer'
import { millisecondsToTimeUnits } from '../timer.utils'

const EMPTY_TIME: TimeLeft = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  totalMs: 0,
}

export function selectTimeLeft(
  state: RootState,
  dateProvider: DateProvider,
): TimeLeft {
  const endAt = state.timer.endAt
  if (!endAt) return EMPTY_TIME

  const totalMs =
    dateProvider.parseISOString(endAt).getTime() - dateProvider.getNowMs()

  if (totalMs <= 0) return EMPTY_TIME

  const timeUnits = millisecondsToTimeUnits(totalMs)
  return { ...timeUnits, totalMs }
}

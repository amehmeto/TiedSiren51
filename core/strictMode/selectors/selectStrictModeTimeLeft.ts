import { millisecondsToTimeUnits } from '@/core/__utils__/time.utils'
import { DateProvider } from '@/core/_ports_/port.date-provider'
import { RootState } from '@/core/_redux_/createStore'
import { TimeLeft } from '../timeLeft'

const EMPTY_TIME: TimeLeft = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  totalMs: 0,
}

export function selectStrictModeTimeLeft(
  state: RootState,
  dateProvider: DateProvider,
): TimeLeft {
  const endedAt = state.strictMode.endedAt
  if (!endedAt) return EMPTY_TIME

  const totalMs =
    dateProvider.parseISOString(endedAt).getTime() - dateProvider.getNowMs()

  if (totalMs <= 0) return EMPTY_TIME

  const timeUnits = millisecondsToTimeUnits(totalMs)
  return { ...timeUnits, totalMs }
}

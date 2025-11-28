import { DateProvider } from '@/core/_ports_/port.date-provider'
import { RootState } from '@/core/_redux_/createStore'
import { TimeRemaining } from '../timer'
import { millisecondsToTimeUnits } from '../timer.utils'

const EMPTY_TIME: TimeRemaining = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  timeLeft: 0,
}

export function selectTimeLeft(
  state: RootState,
  dateProvider: DateProvider,
): TimeRemaining {
  const endAt = state.timer.endAt
  if (!endAt) return EMPTY_TIME

  const timeLeft =
    dateProvider.parseISOString(endAt).getTime() - dateProvider.getNowMs()

  if (timeLeft <= 0) return EMPTY_TIME

  const timeUnits = millisecondsToTimeUnits(timeLeft)
  return { ...timeUnits, timeLeft }
}

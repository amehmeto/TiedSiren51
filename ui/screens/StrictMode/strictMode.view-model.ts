import { DAY, HOUR, MINUTE, SECOND } from '@/core/__constants__/time'
import { DateProvider } from '@/core/_ports_/port.date-provider'
import { RootState } from '@/core/_redux_/createStore'
import { selectIsTimerActive } from '@/core/timer/selectors/selectIsTimerActive'
import { selectTimeLeft } from '@/core/timer/selectors/selectTimeLeft'
import { TimeRemaining } from '@/core/timer/timer'

export enum StrictModeViewState {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
}

type InactiveViewModel = {
  type: StrictModeViewState.Inactive
  countdown: string
  statusMessage: string
  buttonText: string
}

type ActiveViewModel = {
  type: StrictModeViewState.Active
  countdown: string
  endDateTime: string
  inlineRemaining: string
  statusMessage: string
  buttonText: string
}

export type StrictModeViewModel = InactiveViewModel | ActiveViewModel

function formatCountdown(timeLeft: TimeRemaining): string {
  const parts: string[] = []

  const hasDays = timeLeft.days > 0
  const hasHours = timeLeft.hours > 0
  const hasMinutes = timeLeft.minutes > 0

  if (hasDays) parts.push(`${timeLeft.days}d`)
  if (hasHours || hasDays) parts.push(`${timeLeft.hours}h`)
  if (hasMinutes || hasHours || hasDays) parts.push(`${timeLeft.minutes}m`)
  parts.push(`${timeLeft.seconds}s`)

  return parts.join(' ')
}

function formatEndDateTime(timeLeft: TimeRemaining, now: Date): string {
  const durationMs =
    timeLeft.days * DAY +
    timeLeft.hours * HOUR +
    timeLeft.minutes * MINUTE +
    timeLeft.seconds * SECOND
  const endTime = new Date(now.getTime() + durationMs)

  const day = endTime.getDate()
  const month = endTime.getMonth() + 1
  const hour = endTime.getHours()
  const minute = endTime.getMinutes()

  const hour12 = hour % 12 || 12
  const minuteFormatted = minute.toString().padStart(2, '0')
  const period = hour >= 12 ? 'p.m.' : 'a.m.'

  return `Ends ${day}/${month}, ${hour12}:${minuteFormatted} ${period}`
}

export function selectStrictModeViewModel(
  state: RootState,
  dateProvider: DateProvider,
): StrictModeViewModel {
  const isActive = selectIsTimerActive(state, dateProvider)

  if (!isActive) {
    return {
      type: StrictModeViewState.Inactive,
      countdown: '0h 0m 0s',
      statusMessage: 'Set a timer to activate strict mode',
      buttonText: 'Start Timer',
    }
  }

  const timeLeft = selectTimeLeft(state, dateProvider)
  const countdown = formatCountdown(timeLeft)

  return {
    type: StrictModeViewState.Active,
    countdown,
    endDateTime: formatEndDateTime(timeLeft, dateProvider.getNow()),
    inlineRemaining: countdown,
    statusMessage: 'Your blockings are locked against any\nbypassing.',
    buttonText: 'Extend Timer',
  }
}

import { DateProvider } from '@/core/_ports_/date-provider'
import { RootState } from '@/core/_redux_/createStore'
import { selectIsStrictModeActive } from '@/core/strict-mode/selectors/selectIsStrictModeActive'
import { selectStrictModeTimeLeft } from '@/core/strict-mode/selectors/selectStrictModeTimeLeft'
import { formatEndFromOffsets } from '@/ui/utils/timeFormat'
import { TimeLeft } from '@core/strict-mode/time-left'

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

function formatCountdown(timeLeft: TimeLeft): string {
  const { days, hours, minutes, seconds } = timeLeft
  const parts: string[] = []

  const hasDays = days > 0
  const hasHours = hours > 0
  const hasMinutes = minutes > 0

  if (hasDays) parts.push(`${days}d`)
  if (hasHours || hasDays) parts.push(`${hours}h`)
  if (hasMinutes || hasHours || hasDays) parts.push(`${minutes}m`)
  parts.push(`${seconds}s`)

  return parts.join(' ')
}

export function selectStrictModeViewModel(
  state: RootState,
  dateProvider: DateProvider,
): StrictModeViewModel {
  const isActive = selectIsStrictModeActive(state, dateProvider)

  if (!isActive) {
    return {
      type: StrictModeViewState.Inactive,
      countdown: '0h 0m 0s',
      statusMessage: 'Set a timer to activate strict mode',
      buttonText: 'Start Timer',
    }
  }

  const timeLeft = selectStrictModeTimeLeft(state, dateProvider)
  const { days, hours, minutes } = timeLeft
  const countdown = formatCountdown(timeLeft)

  return {
    type: StrictModeViewState.Active,
    countdown,
    endDateTime: formatEndFromOffsets({
      now: dateProvider.getNow(),
      days,
      hours,
      minutes,
      dateProvider,
    }),
    inlineRemaining: countdown,
    statusMessage: 'Your blockings are locked against any\nbypassing.',
    buttonText: 'Extend Timer',
  }
}

import { DateProvider } from '@/core/_ports_/port.date-provider'
import { RootState } from '@/core/_redux_/createStore'

export function selectIsTimerActive(
  state: RootState,
  dateProvider: DateProvider,
): boolean {
  const endAt = state.timer.endAt
  if (!endAt) return false

  return dateProvider.parseISOString(endAt).getTime() > dateProvider.getNowMs()
}

import { DateProvider } from '@/core/_ports_/date-provider'
import { RootState } from '@/core/_redux_/createStore'

export function selectIsStrictModeActive(
  state: RootState,
  dateProvider: DateProvider,
): boolean {
  const endedAt = state.strictMode.endedAt
  if (!endedAt) return false

  return (
    dateProvider.parseISOString(endedAt).getTime() > dateProvider.getNowMs()
  )
}

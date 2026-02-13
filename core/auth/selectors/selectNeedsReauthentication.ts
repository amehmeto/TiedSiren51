import { REAUTH_COOLDOWN_MS } from '@/core/__constants__/time'
import { DateProvider } from '@/core/_ports_/date-provider'
import { RootState } from '@/core/_redux_/createStore'

export function selectNeedsReauthentication(
  state: RootState,
  dateProvider: DateProvider,
): boolean {
  const { lastReauthenticatedAt } = state.auth
  if (!lastReauthenticatedAt) return true

  const reauthTime = dateProvider
    .parseISOString(lastReauthenticatedAt)
    .getTime()
  return dateProvider.getNowMs() - reauthTime >= REAUTH_COOLDOWN_MS
}

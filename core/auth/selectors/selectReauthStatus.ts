import { RootState } from '@/core/_redux_/createStore'

export function selectReauthStatus(state: RootState) {
  const { isReauthenticating, reauthError } = state.auth
  return { isReauthenticating, reauthError }
}

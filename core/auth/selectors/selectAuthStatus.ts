import { RootState } from '@/core/_redux_/createStore'

export function selectAuthStatus(state: RootState) {
  const { isLoading, error } = state.auth
  return { isLoading, error }
}

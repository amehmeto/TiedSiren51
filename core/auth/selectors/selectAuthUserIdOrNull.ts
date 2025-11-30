import { RootState } from '@/core/_redux_/createStore'

export const selectAuthUserIdOrNull = (state: RootState): string | null => {
  return state.auth.authUser?.id ?? null
}

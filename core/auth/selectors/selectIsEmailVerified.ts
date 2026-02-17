import { RootState } from '@/core/_redux_/createStore'

export const selectIsEmailVerified = (state: RootState) =>
  state.auth.authUser?.isEmailVerified ?? false

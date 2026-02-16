import { RootState } from '@/core/_redux_/createStore'
import { AuthProvider } from '@/core/auth/auth-user'

export const selectAuthProvider = (
  state: RootState,
): AuthProvider | undefined => {
  return state.auth.authUser?.authProvider
}

import { RootState } from '@/core/_redux_/createStore'
import { AuthProvider } from '@/core/auth/auth-user'

export enum EmailVerificationBannerViewState {
  Hidden = 'HIDDEN',
  Visible = 'VISIBLE',
}

export function selectEmailVerificationBannerViewModel(
  state: RootState,
): EmailVerificationBannerViewState {
  const { authUser } = state.auth

  return !authUser ||
    authUser.isEmailVerified ||
    authUser.authProvider !== AuthProvider.Email
    ? EmailVerificationBannerViewState.Hidden
    : EmailVerificationBannerViewState.Visible
}

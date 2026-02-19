import { RootState } from '@/core/_redux_/createStore'
import { AuthProvider } from '@/core/auth/auth-user'

export enum EmailVerificationBannerViewState {
  Hidden = 'HIDDEN',
  Visible = 'VISIBLE',
}

type HiddenViewModel = {
  type: EmailVerificationBannerViewState.Hidden
}

type VisibleViewModel = {
  type: EmailVerificationBannerViewState.Visible
}

export type EmailVerificationBannerViewModel =
  | HiddenViewModel
  | VisibleViewModel

export function selectEmailVerificationBannerViewModel(
  state: RootState,
): EmailVerificationBannerViewModel {
  const { authUser } = state.auth

  return !authUser ||
    authUser.isEmailVerified ||
    authUser.authProvider !== AuthProvider.Email
    ? { type: EmailVerificationBannerViewState.Hidden }
    : { type: EmailVerificationBannerViewState.Visible }
}

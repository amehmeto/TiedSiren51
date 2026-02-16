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
  isSendingVerificationEmail: boolean
  isVerificationEmailSent: boolean
  isRefreshingEmailVerification: boolean
  resendButtonText: string
  refreshButtonText: string
}

export type EmailVerificationBannerViewModel =
  | HiddenViewModel
  | VisibleViewModel

export function selectEmailVerificationBannerViewModel(
  state: RootState,
): EmailVerificationBannerViewModel {
  const { authUser } = state.auth

  if (
    !authUser ||
    authUser.isEmailVerified ||
    authUser.authProvider === AuthProvider.Google
  )
    return { type: EmailVerificationBannerViewState.Hidden }

  const {
    isSendingVerificationEmail,
    isVerificationEmailSent,
    isRefreshingEmailVerification,
  } = state.auth

  return {
    type: EmailVerificationBannerViewState.Visible,
    isSendingVerificationEmail,
    isVerificationEmailSent,
    isRefreshingEmailVerification,
    resendButtonText: isSendingVerificationEmail
      ? 'Sending...'
      : 'Resend verification email',
    refreshButtonText: "I've verified my email",
  }
}

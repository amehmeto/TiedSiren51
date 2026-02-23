import { RootState } from '@/core/_redux_/createStore'
import { AuthProvider } from '@/core/auth/auth-user'

type HiddenBanner = {
  visible: false
}

type VisibleBanner = {
  visible: true
  isSendingVerificationEmail: boolean
  resendVerificationEmailLabel: string
  userEmail: string
}

type EmailVerificationBannerViewModel = HiddenBanner | VisibleBanner

export function selectEmailVerificationBannerViewModel(
  state: RootState,
): EmailVerificationBannerViewModel {
  const { authUser, isSendingVerificationEmail } = state.auth

  if (!authUser) return { visible: false }

  const { isEmailVerified, authProvider, email } = authUser

  if (isEmailVerified || authProvider !== AuthProvider.Email)
    return { visible: false }

  return {
    visible: true,
    isSendingVerificationEmail,
    resendVerificationEmailLabel: isSendingVerificationEmail
      ? 'Sending...'
      : 'Resend Verification Email',
    userEmail: email,
  }
}

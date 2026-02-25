import { RootState } from '@/core/_redux_/createStore'
import { AuthProvider } from '@/core/auth/auth-user'
import { getOpenEmailLabel } from '@/core/auth/email-provider'

type HiddenBanner = {
  visible: false
}

type VisibleBanner = {
  visible: true
  title: string
  description: string
  isSendingVerificationEmail: boolean
  openEmailLabel: string
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
    title: 'Verify your email',
    description: 'Check your inbox and tap the verification link.',
    openEmailLabel: getOpenEmailLabel(email),
    isSendingVerificationEmail,
    resendVerificationEmailLabel: isSendingVerificationEmail
      ? 'Sending...'
      : 'Resend Verification Email',
    userEmail: email,
  }
}

import { RootState } from '@/core/_redux_/createStore'
import { AuthProvider } from '@/core/auth/auth-user'

type SettingsViewModel = {
  email: string
  authProviderLabel: string
  hasPasswordProvider: boolean
  showResendVerificationEmail: boolean
  isSendingVerificationEmail: boolean
  resendVerificationEmailLabel: string
}

const { Email, Google, Apple } = AuthProvider

const AUTH_PROVIDER_LABELS: Record<AuthProvider, string> = {
  [Email]: 'Password',
  [Google]: 'Google',
  [Apple]: 'Apple',
}

export function selectSettingsViewModel(state: RootState): SettingsViewModel {
  const authUser = state.auth.authUser
  const provider = authUser ? authUser.authProvider : Email
  const { isSendingVerificationEmail } = state.auth

  return {
    email: authUser?.email ?? '',
    authProviderLabel: AUTH_PROVIDER_LABELS[provider],
    hasPasswordProvider: provider === Email,
    showResendVerificationEmail:
      authUser?.authProvider === Email && authUser.isEmailVerified === false,
    isSendingVerificationEmail,
    resendVerificationEmailLabel: isSendingVerificationEmail
      ? 'Sending...'
      : 'Resend Verification Email',
  }
}

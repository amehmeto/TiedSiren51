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
  const { authProvider, email, isEmailVerified } = authUser
    ? authUser
    : { authProvider: Email, email: '', isEmailVerified: false }
  const { isSendingVerificationEmail } = state.auth

  return {
    email,
    authProviderLabel: AUTH_PROVIDER_LABELS[authProvider],
    hasPasswordProvider: authProvider === Email,
    showResendVerificationEmail:
      authProvider === Email && isEmailVerified === false,
    isSendingVerificationEmail,
    resendVerificationEmailLabel: isSendingVerificationEmail
      ? 'Sending...'
      : 'Resend Verification Email',
  }
}

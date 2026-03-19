import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '@/core/_redux_/createStore'
import { AuthProvider } from '@/core/auth/auth-user'

type SettingsViewModel = {
  email: string
  authProviderLabel: string
  hasPasswordProvider: boolean
}

const { Email, Google, Apple } = AuthProvider

const AUTH_PROVIDER_LABELS: Record<AuthProvider, string> = {
  [Email]: 'Password',
  [Google]: 'Google',
  [Apple]: 'Apple',
}

export const selectSettingsViewModel = createSelector(
  [(state: RootState) => state.auth],
  (auth): SettingsViewModel => {
    const authUser = auth.authUser
    const provider = authUser ? authUser.authProvider : Email

    return {
      email: authUser?.email ?? '',
      authProviderLabel: AUTH_PROVIDER_LABELS[provider],
      hasPasswordProvider: provider === Email,
    }
  },
)

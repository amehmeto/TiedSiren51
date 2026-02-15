import { createAction, createReducer } from '@reduxjs/toolkit'
import { ISODateString } from '@/core/_ports_/date-provider'
import { AuthUser } from '@/core/auth/auth-user'
import { logOut } from '@/core/auth/usecases/log-out.usecase'
import { signInWithApple } from '@/core/auth/usecases/sign-in-with-apple.usecase'
import { signInWithGoogle } from '@/core/auth/usecases/sign-in-with-google.usecase'
import { signUpWithEmail } from '@/core/auth/usecases/sign-up-with-email.usecase'
import { deleteAccount } from './usecases/delete-account.usecase'
import { reauthenticateWithGoogle } from './usecases/reauthenticate-with-google.usecase'
import { reauthenticate } from './usecases/reauthenticate.usecase'
import { resetPassword } from './usecases/reset-password.usecase'
import { signInWithEmail } from './usecases/sign-in-with-email.usecase'

export type AuthState = {
  authUser: AuthUser | null
  isLoading: boolean
  error: string | null
  isPasswordResetSent: boolean
  lastReauthenticatedAt: ISODateString | null
  isReauthenticating: boolean
  reauthError: string | null
  isDeletingAccount: boolean
  deleteAccountError: string | null
}

export const userAuthenticated = createAction<AuthUser>(
  'auth/userAuthenticated',
)

export const clearAuthState = createAction('auth/clearAuthState')

export const clearError = createAction('auth/clearError')

export const setError = createAction<string>('auth/setError')

export const clearReauthError = createAction('auth/clearReauthError')

export const clearDeleteAccountError = createAction(
  'auth/clearDeleteAccountError',
)

export const reducer = createReducer<AuthState>(
  {
    authUser: null,
    isLoading: false,
    error: null,
    isPasswordResetSent: false,
    lastReauthenticatedAt: null,
    isReauthenticating: false,
    reauthError: null,
    isDeletingAccount: false,
    deleteAccountError: null,
  },
  (builder) => {
    builder
      .addCase(userAuthenticated, (state, action) => {
        state.authUser = action.payload
        state.error = null
        state.isLoading = false
      })
      .addCase(clearError, (state) => {
        state.error = null
      })
      .addCase(setError, (state, action) => {
        state.error = action.payload
      })
      .addCase(clearReauthError, (state) => {
        state.reauthError = null
      })
      .addCase(signInWithEmail.fulfilled, (state, action) => {
        state.authUser = action.payload
        state.error = null
        state.isLoading = false
      })
      .addCase(signUpWithEmail.fulfilled, (state, action) => {
        state.authUser = action.payload
        state.error = null
        state.isLoading = false
      })
      .addCase(signInWithGoogle.fulfilled, (state, action) => {
        state.authUser = action.payload
        state.error = null
        state.isLoading = false
      })
      .addCase(signInWithApple.fulfilled, (state, action) => {
        state.authUser = action.payload
        state.error = null
        state.isLoading = false
      })
      .addCase(logOut.fulfilled, (state) => {
        state.authUser = null
        state.error = null
        state.isLoading = false
        state.lastReauthenticatedAt = null
        state.isReauthenticating = false
        state.reauthError = null
      })

      .addCase(clearAuthState, (state) => {
        state.isLoading = false
        state.error = null
        state.isPasswordResetSent = false
      })
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.isPasswordResetSent = false
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false
        state.isPasswordResetSent = true
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message ?? null
      })
      .addCase(signInWithEmail.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(signUpWithEmail.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(signInWithGoogle.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(signInWithApple.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(signInWithEmail.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message ?? null
      })
      .addCase(signUpWithEmail.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message ?? null
      })
      .addCase(signInWithGoogle.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message ?? null
      })
      .addCase(signInWithApple.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message ?? null
      })

      .addCase(reauthenticate.pending, (state) => {
        state.isReauthenticating = true
        state.reauthError = null
      })
      .addCase(reauthenticate.fulfilled, (state, action) => {
        state.isReauthenticating = false
        state.lastReauthenticatedAt = action.payload
        state.reauthError = null
      })
      .addCase(reauthenticate.rejected, (state, action) => {
        state.isReauthenticating = false
        state.reauthError = action.error.message ?? null
      })

      .addCase(reauthenticateWithGoogle.pending, (state) => {
        state.isReauthenticating = true
        state.reauthError = null
      })
      .addCase(reauthenticateWithGoogle.fulfilled, (state, action) => {
        state.isReauthenticating = false
        state.lastReauthenticatedAt = action.payload
        state.reauthError = null
      })
      .addCase(reauthenticateWithGoogle.rejected, (state, action) => {
        state.isReauthenticating = false
        state.reauthError = action.error.message ?? null
      })

      .addCase(clearDeleteAccountError, (state) => {
        state.deleteAccountError = null
      })
      .addCase(deleteAccount.pending, (state) => {
        state.isDeletingAccount = true
        state.deleteAccountError = null
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.authUser = null
        state.isDeletingAccount = false
        state.deleteAccountError = null
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.isDeletingAccount = false
        state.deleteAccountError = action.error.message ?? null
      })
  },
)

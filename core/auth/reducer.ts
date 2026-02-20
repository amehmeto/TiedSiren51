import {
  createAction,
  createReducer,
  isFulfilled,
  isPending,
  isRejected,
} from '@reduxjs/toolkit'
import { ISODateString } from '@/core/_ports_/date-provider'
import { AuthUser } from '@/core/auth/auth-user'
import { deleteAccount } from '@/core/auth/usecases/delete-account.usecase'
import { logOut } from '@/core/auth/usecases/log-out.usecase'
import { signInWithApple } from '@/core/auth/usecases/sign-in-with-apple.usecase'
import { signInWithGoogle } from '@/core/auth/usecases/sign-in-with-google.usecase'
import { signUpWithEmail } from '@/core/auth/usecases/sign-up-with-email.usecase'
import { AuthErrorType, isAuthErrorType } from './auth-error-type'
import { applyEmailVerificationCode } from './usecases/apply-email-verification-code.usecase'
import { changePassword } from './usecases/change-password.usecase'
import { confirmPasswordReset } from './usecases/confirm-password-reset.usecase'
import { reauthenticateWithGoogle } from './usecases/reauthenticate-with-google.usecase'
import { reauthenticate } from './usecases/reauthenticate.usecase'
import { resetPassword } from './usecases/reset-password.usecase'
import { sendVerificationEmail } from './usecases/send-verification-email.usecase'
import { signInWithEmail } from './usecases/sign-in-with-email.usecase'

export type AuthState = {
  authUser: AuthUser | null
  isLoading: boolean
  error: string | null
  errorType: AuthErrorType | null
  isPasswordResetSent: boolean
  email: string
  password: string
  lastReauthenticatedAt: ISODateString | null
  isReauthenticating: boolean
  reauthError: string | null
  isConfirmingPasswordReset: boolean
  confirmPasswordResetError: string | null
  isPasswordResetConfirmed: boolean
  isDeletingAccount: boolean
  deleteAccountError: string | null
  deleteConfirmText: string
  isChangingPassword: boolean
  changePasswordError: string | null
  hasChangePasswordSucceeded: boolean
  changePasswordSuccessCount: number
}

export const userAuthenticated = createAction<AuthUser>(
  'auth/userAuthenticated',
)

export const clearAuthState = createAction('auth/clearAuthState')

export const clearError = createAction('auth/clearError')

export const setError = createAction<string>('auth/setError')

export const setEmail = createAction<string>('auth/setEmail')

export const setPassword = createAction<string>('auth/setPassword')

export const clearReauthError = createAction('auth/clearReauthError')

export const clearConfirmPasswordResetError = createAction(
  'auth/clearConfirmPasswordResetError',
)

export const clearConfirmPasswordResetState = createAction(
  'auth/clearConfirmPasswordResetState',
)

export const clearDeleteAccountError = createAction(
  'auth/clearDeleteAccountError',
)

export const clearChangePasswordError = createAction(
  'auth/clearChangePasswordError',
)

export const clearChangePasswordSuccess = createAction(
  'auth/clearChangePasswordSuccess',
)

export const setDeleteConfirmText = createAction<string>(
  'auth/setDeleteConfirmText',
)

function createInitialAuthState(): AuthState {
  return {
    authUser: null,
    isLoading: false,
    error: null,
    errorType: null,
    isPasswordResetSent: false,
    email: '',
    password: '',
    lastReauthenticatedAt: null,
    isReauthenticating: false,
    reauthError: null,
    isConfirmingPasswordReset: false,
    confirmPasswordResetError: null,
    isPasswordResetConfirmed: false,
    isDeletingAccount: false,
    deleteAccountError: null,
    deleteConfirmText: '',
    isChangingPassword: false,
    changePasswordError: null,
    hasChangePasswordSucceeded: false,
    changePasswordSuccessCount: 0,
  }
}

export const reducer = createReducer<AuthState>(
  createInitialAuthState(),
  (builder) => {
    // All auth thunks share the same pending/fulfilled/rejected state transitions
    // (loading, error, errorType). The addMatcher calls below handle this shared
    // logic, while thunk-specific behavior (e.g. setting authUser) stays in addCase.
    const authThunks = [
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signInWithApple,
      resetPassword,
      logOut,
    ] as const

    builder
      .addCase(userAuthenticated, (state, action) => {
        state.authUser = action.payload
        state.error = null
        state.errorType = null
        state.isLoading = false
      })
      .addCase(clearError, (state) => {
        state.error = null
        state.errorType = null
      })
      .addCase(setError, (state, action) => {
        state.error = action.payload
        state.errorType = null
      })
      .addCase(setEmail, (state, action) => {
        state.email = action.payload
      })
      .addCase(setPassword, (state, action) => {
        state.password = action.payload
      })
      .addCase(clearReauthError, (state) => {
        state.reauthError = null
      })
      .addCase(signInWithEmail.fulfilled, (state, action) => {
        state.authUser = action.payload
      })
      .addCase(signUpWithEmail.fulfilled, (state, action) => {
        state.authUser = action.payload
      })
      .addCase(signInWithGoogle.fulfilled, (state, action) => {
        state.authUser = action.payload
      })
      .addCase(signInWithApple.fulfilled, (state, action) => {
        state.authUser = action.payload
      })
      .addCase(logOut.fulfilled, (state) => {
        state.authUser = null
        state.email = ''
        state.password = ''
        state.lastReauthenticatedAt = null
        state.isReauthenticating = false
        state.reauthError = null
      })
      .addCase(clearAuthState, (state) => {
        state.isLoading = false
        state.error = null
        state.errorType = null
        state.isPasswordResetSent = false
        state.email = ''
        state.password = ''
      })
      .addCase(resetPassword.pending, (state) => {
        state.isPasswordResetSent = false
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isPasswordResetSent = true
      })

      .addCase(sendVerificationEmail.rejected, (state, action) => {
        state.error = action.error.message ?? null
        state.errorType = isAuthErrorType(action.error.code)
          ? action.error.code
          : null
      })

      .addCase(applyEmailVerificationCode.fulfilled, (state) => {
        if (state.authUser) state.authUser.isEmailVerified = true
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

      .addCase(clearConfirmPasswordResetError, (state) => {
        state.confirmPasswordResetError = null
      })
      .addCase(clearConfirmPasswordResetState, (state) => {
        state.isConfirmingPasswordReset = false
        state.confirmPasswordResetError = null
        state.isPasswordResetConfirmed = false
      })
      .addCase(confirmPasswordReset.pending, (state) => {
        state.isConfirmingPasswordReset = true
        state.confirmPasswordResetError = null
        state.isPasswordResetConfirmed = false
      })
      .addCase(confirmPasswordReset.fulfilled, (state) => {
        state.isConfirmingPasswordReset = false
        state.isPasswordResetConfirmed = true
        state.confirmPasswordResetError = null
      })
      .addCase(confirmPasswordReset.rejected, (state, action) => {
        state.isConfirmingPasswordReset = false
        state.confirmPasswordResetError = action.error.message ?? null
      })

      .addCase(clearChangePasswordError, (state) => {
        state.changePasswordError = null
      })
      .addCase(clearChangePasswordSuccess, (state) => {
        state.hasChangePasswordSucceeded = false
      })
      .addCase(changePassword.pending, (state) => {
        state.isChangingPassword = true
        state.changePasswordError = null
        state.hasChangePasswordSucceeded = false
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isChangingPassword = false
        state.changePasswordError = null
        state.hasChangePasswordSucceeded = true
        state.changePasswordSuccessCount += 1
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isChangingPassword = false
        state.changePasswordError = action.error.message ?? null
        state.hasChangePasswordSucceeded = false
      })

      .addCase(clearDeleteAccountError, (state) => {
        state.deleteAccountError = null
      })
      .addCase(setDeleteConfirmText, (state, action) => {
        state.deleteConfirmText = action.payload
        state.deleteAccountError = null
      })
      .addCase(deleteAccount.pending, (state) => {
        state.isDeletingAccount = true
        state.deleteAccountError = null
      })
      .addCase(deleteAccount.fulfilled, () => createInitialAuthState())
      .addCase(deleteAccount.rejected, (state, action) => {
        state.isDeletingAccount = false
        state.deleteAccountError = action.error.message ?? null
      })
      .addMatcher(isPending(...authThunks), (state) => {
        state.isLoading = true
        state.error = null
        state.errorType = null
      })
      .addMatcher(isFulfilled(...authThunks), (state) => {
        state.error = null
        state.errorType = null
        state.isLoading = false
        state.password = ''
      })
      .addMatcher(isRejected(...authThunks), (state, action) => {
        state.isLoading = false
        state.error = action.error.message ?? null
        state.errorType = isAuthErrorType(action.error.code)
          ? action.error.code
          : null
        if (state.errorType === AuthErrorType.Credential) state.password = ''
      })
  },
)

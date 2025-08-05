import { createAction, createReducer } from '@reduxjs/toolkit'
import { signInWithGoogle } from '@/core/auth/usecases/sign-in-with-google.usecase'
import { AuthUser } from '@/core/auth/authUser'
import { signInWithApple } from '@/core/auth/usecases/sign-in-with-apple.usecase'
import { signUpWithEmail } from '@/core/auth/usecases/sign-up-with-email.usecase'
import { logOut } from '@/core/auth/usecases/log-out.usecase'
import { signInWithEmail } from './usecases/sign-in-with-email.usecase'

export type AuthState = {
  authUser: AuthUser | null
  isLoading: boolean
  error: string | null
  validationErrors: Record<string, string>
}

export const userAuthenticated = createAction<AuthUser>(
  'auth/userAuthenticated',
)
export const clearAuthError = createAction('auth/clearAuthError')

export const setValidationErrors = createAction<Record<string, string>>(
  'auth/setValidationErrors',
)

export const clearValidationErrors = createAction('auth/clearValidationErrors')

export const clearInputValidationError = createAction<string>(
  'auth/clearInputValidationError',
)

export const reducer = createReducer<AuthState>(
  {
    authUser: null,
    isLoading: false,
    error: null,
    validationErrors: {},
  },
  (builder) => {
    builder
      .addCase(userAuthenticated, (state, action) => {
        state.authUser = action.payload
        state.error = null
        state.isLoading = false
        state.validationErrors = {}
      })
      .addCase(signInWithEmail.fulfilled, (state, action) => {
        state.authUser = action.payload
        state.error = null
        state.isLoading = false
        state.validationErrors = {}
      })
      .addCase(signUpWithEmail.fulfilled, (state, action) => {
        state.authUser = action.payload
        state.error = null
        state.isLoading = false
        state.validationErrors = {}
      })
      .addCase(signInWithGoogle.fulfilled, (state, action) => {
        state.authUser = action.payload
        state.error = null
        state.isLoading = false
        state.validationErrors = {}
      })
      .addCase(signInWithApple.fulfilled, (state, action) => {
        state.authUser = action.payload
        state.error = null
        state.isLoading = false
        state.validationErrors = {}
      })
      .addCase(logOut.fulfilled, (state) => {
        state.authUser = null
        state.error = null
        state.isLoading = false
        state.validationErrors = {}
      })

      .addCase(signInWithEmail.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.validationErrors = {}
      })
      .addCase(signUpWithEmail.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.validationErrors = {}
      })
      .addCase(signInWithGoogle.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.validationErrors = {}
      })
      .addCase(signInWithApple.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.validationErrors = {}
      })

      .addCase(signInWithEmail.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload ?? null
      })
      .addCase(signUpWithEmail.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload ?? null
      })
      .addCase(signInWithGoogle.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload ?? null
      })
      .addCase(signInWithApple.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload ?? null
      })

      .addCase(clearAuthError, (state) => {
        state.error = null
      })
      .addCase(setValidationErrors, (state, action) => {
        state.validationErrors = action.payload
      })
      .addCase(clearValidationErrors, (state) => {
        state.validationErrors = {}
      })
      .addCase(clearInputValidationError, (state, action) => {
        const { [action.payload]: removed, ...rest } = state.validationErrors
        state.validationErrors = rest
      })
  },
)

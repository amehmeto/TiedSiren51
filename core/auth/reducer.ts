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
}

export const userAuthenticated = createAction<AuthUser>(
  'auth/userAuthenticated',
)
export const clearAuthError = createAction('auth/clearAuthError')

export const reducer = createReducer<AuthState>(
  {
    authUser: null,
    isLoading: false,
    error: null,
  },
  (builder) => {
    builder
      .addCase(userAuthenticated, (state, action) => {
        state.authUser = action.payload
        state.error = null
        state.isLoading = false
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
        state.error =
          typeof action.payload === 'string' ? action.payload : 'Sign in failed'
      })
      .addCase(signUpWithEmail.rejected, (state, action) => {
        state.isLoading = false
        state.error =
          typeof action.payload === 'string' ? action.payload : 'Sign up failed'
      })
      .addCase(signInWithGoogle.rejected, (state, action) => {
        state.isLoading = false
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : 'Google sign in failed'
      })
      .addCase(signInWithApple.rejected, (state, action) => {
        state.isLoading = false
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : 'Apple sign in failed'
      })

      .addCase(clearAuthError, (state) => {
        state.error = null
      })
  },
)

import { createAction, createReducer } from '@reduxjs/toolkit'
import { AuthUser } from '@/core/auth/auth-user'
import { logOut } from '@/core/auth/usecases/log-out.usecase'
import { signInWithApple } from '@/core/auth/usecases/sign-in-with-apple.usecase'
import { signInWithGoogle } from '@/core/auth/usecases/sign-in-with-google.usecase'
import { signUpWithEmail } from '@/core/auth/usecases/sign-up-with-email.usecase'
import { signInWithEmail } from './usecases/sign-in-with-email.usecase'

export type AuthState = {
  authUser: AuthUser | null
  isLoading: boolean
  error: string | null
}

export const userAuthenticated = createAction<AuthUser>(
  'auth/userAuthenticated',
)

export const clearAuthState = createAction('auth/clearAuthState')

export const clearError = createAction('auth/clearError')

export const setError = createAction<string>('auth/setError')

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
      .addCase(clearError, (state) => {
        state.error = null
      })
      .addCase(setError, (state, action) => {
        state.error = action.payload
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

      .addCase(clearAuthState, (state) => {
        state.isLoading = false
        state.error = null
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
  },
)

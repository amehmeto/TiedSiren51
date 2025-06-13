import { createAction, createReducer } from '@reduxjs/toolkit'
import { signInWithGoogle } from '@/core/auth/usecases/sign-in-with-google.usecase'
import { AuthUser } from '@/core/auth/authUser'
import { signInWithApple } from '@/core/auth/usecases/sign-in-with-apple.usecase'
import { signUpWithEmail } from '@/core/auth/usecases/sign-up-with-email.usecase'
import { logOut } from '@/core/auth/usecases/log-out.usecase'
import { signInWithEmail } from './usecases/sign-in-with-email.usecase'

export type AuthState = {
  authUser: AuthUser | null
}

export const userAuthenticated = createAction<AuthUser>(
  'auth/userAuthenticated',
)

export const reducer = createReducer<AuthState>(
  {
    authUser: null,
  },
  (builder) => {
    builder
      .addCase(userAuthenticated, (state, action) => {
        state.authUser = action.payload
      })
      .addCase(signInWithGoogle.fulfilled, (state, action) => {
        state.authUser = action.payload
      })
      .addCase(signInWithApple.fulfilled, (state, action) => {
        state.authUser = action.payload
      })
      .addCase(signInWithEmail.fulfilled, (state, action) => {
        state.authUser = action.payload
      })
      .addCase(signUpWithEmail.fulfilled, (state, action) => {
        state.authUser = action.payload
      })
      .addCase(logOut.fulfilled, (state) => {
        state.authUser = null
      })
  },
)

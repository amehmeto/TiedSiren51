import { createAction, createReducer } from '@reduxjs/toolkit'
import { authenticateWithGoogle } from '@/core/auth/usecases/authenticate-with-google.usecase'
import { AuthUser } from '@/core/auth/authUser'
import { authenticateWithApple } from '@/core/auth/usecases/authenticate-with-apple.usecase'
import { authenticateWithEmail } from '@/core/auth/usecases/authenticate-with-email.usecase'

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
      .addCase(authenticateWithGoogle.fulfilled, (state, action) => {
        state.authUser = action.payload
      })
      .addCase(authenticateWithApple.fulfilled, (state, action) => {
        state.authUser = action.payload
      })
      .addCase(authenticateWithEmail.fulfilled, (state, action) => {
        state.authUser = action.payload
      })
  },
)

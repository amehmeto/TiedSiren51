import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '@/core/_redux_/createStore'
import { AuthBaseViewModel } from '@/ui/screens/Auth/auth-view-model-base'

export enum LoginViewState {
  Idle = 'IDLE',
  Loading = 'LOADING',
  Error = 'ERROR',
}

export type LoginViewModel = AuthBaseViewModel<LoginViewState> & {
  error: string | null
  email: string
  password: string
  isUserAuthenticated: boolean
}

export const selectLoginViewModel = createSelector(
  [(state: RootState) => state.auth],
  (auth): LoginViewModel => {
    const { isLoading, email, password, authUser } = auth
    const error = auth.error?.message ?? null
    const isUserAuthenticated = authUser !== null
    const { Loading, Error, Idle } = LoginViewState

    if (isLoading) {
      return {
        type: Loading,
        buttonText: 'LOGGING IN...',
        isInputDisabled: true,
        error: null,
        email,
        password,
        isUserAuthenticated,
      }
    }

    if (error) {
      return {
        type: Error,
        buttonText: 'LOG IN',
        isInputDisabled: false,
        error,
        email,
        password,
        isUserAuthenticated,
      }
    }

    return {
      type: Idle,
      buttonText: 'LOG IN',
      isInputDisabled: false,
      error: null,
      email,
      password,
      isUserAuthenticated,
    }
  },
)

import { RootState } from '@/core/_redux_/createStore'
import { AuthErrorType } from '@/core/auth/auth-error-type'

export enum LoginViewState {
  Idle = 'IDLE',
  Loading = 'LOADING',
  Error = 'ERROR',
}

type IdleViewModel = {
  type: LoginViewState.Idle
  buttonText: string
  isInputDisabled: boolean
}

type LoadingViewModel = {
  type: LoginViewState.Loading
  buttonText: string
  isInputDisabled: boolean
}

type ErrorViewModel = {
  type: LoginViewState.Error
  buttonText: string
  isInputDisabled: boolean
  error: string
  shouldClearPassword: boolean
}

export type LoginViewModel = IdleViewModel | LoadingViewModel | ErrorViewModel

export function selectLoginViewModel(state: RootState): LoginViewModel {
  const { isLoading, error, errorType } = state.auth
  const { Loading, Error, Idle } = LoginViewState

  if (isLoading) {
    return {
      type: Loading,
      buttonText: 'LOGGING IN...',
      isInputDisabled: true,
    }
  }

  if (error) {
    return {
      type: Error,
      buttonText: 'LOG IN',
      isInputDisabled: false,
      error,
      shouldClearPassword: errorType === AuthErrorType.Credential,
    }
  }

  return {
    type: Idle,
    buttonText: 'LOG IN',
    isInputDisabled: false,
  }
}

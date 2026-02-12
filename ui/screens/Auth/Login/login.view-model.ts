import { RootState } from '@/core/_redux_/createStore'

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

const CREDENTIAL_ERRORS = [
  'Invalid email or password',
  'Invalid credentials',
  'No account found with this email',
]

function isCredentialError(error: string): boolean {
  return CREDENTIAL_ERRORS.some((credError) =>
    error.toLowerCase().includes(credError.toLowerCase()),
  )
}

export function selectLoginViewModel(state: RootState): LoginViewModel {
  const { isLoading, error } = state.auth
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
      shouldClearPassword: isCredentialError(error),
    }
  }

  return {
    type: Idle,
    buttonText: 'LOG IN',
    isInputDisabled: false,
  }
}

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

export function selectLoginViewModel(state: RootState): LoginViewModel {
  const { isLoading, error, email, password, authUser } = state.auth
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
}

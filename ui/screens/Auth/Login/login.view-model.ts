import { RootState } from '@/core/_redux_/createStore'
import {
  AuthBaseViewModel,
  AuthErrorViewModel,
} from '@/ui/screens/Auth/auth-view-model-base'

export enum LoginViewState {
  Idle = 'IDLE',
  Loading = 'LOADING',
  Error = 'ERROR',
}

type LoginErrorViewModel = AuthErrorViewModel<LoginViewState.Error> & {
  shouldClearPassword: boolean
}

export type LoginViewModel =
  | AuthBaseViewModel<LoginViewState.Idle>
  | AuthBaseViewModel<LoginViewState.Loading>
  | LoginErrorViewModel

export function selectLoginViewModel(state: RootState): LoginViewModel {
  const { isLoading, error, isPasswordClearRequested } = state.auth
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
      shouldClearPassword: isPasswordClearRequested,
    }
  }

  return {
    type: Idle,
    buttonText: 'LOG IN',
    isInputDisabled: false,
  }
}

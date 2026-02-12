import { RootState } from '@/core/_redux_/createStore'

export enum SignUpViewState {
  Idle = 'IDLE',
  Loading = 'LOADING',
  Error = 'ERROR',
}

type IdleViewModel = {
  type: SignUpViewState.Idle
  buttonText: string
  isInputDisabled: boolean
}

type LoadingViewModel = {
  type: SignUpViewState.Loading
  buttonText: string
  isInputDisabled: boolean
}

type ErrorViewModel = {
  type: SignUpViewState.Error
  buttonText: string
  isInputDisabled: boolean
  error: string
}

export type SignUpViewModel = IdleViewModel | LoadingViewModel | ErrorViewModel

export function selectSignUpViewModel(state: RootState): SignUpViewModel {
  const { isLoading, error } = state.auth
  const { Loading, Error, Idle } = SignUpViewState

  if (isLoading) {
    return {
      type: Loading,
      buttonText: 'CREATING ACCOUNT...',
      isInputDisabled: true,
    }
  }

  if (error) {
    return {
      type: Error,
      buttonText: 'CREATE YOUR ACCOUNT',
      isInputDisabled: false,
      error,
    }
  }

  return {
    type: Idle,
    buttonText: 'CREATE YOUR ACCOUNT',
    isInputDisabled: false,
  }
}

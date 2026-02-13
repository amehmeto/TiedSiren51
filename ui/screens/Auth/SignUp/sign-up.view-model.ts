import { RootState } from '@/core/_redux_/createStore'
import { AuthBaseViewModel } from '@/ui/screens/Auth/auth-view-model-base'

export enum SignUpViewState {
  Idle = 'IDLE',
  Loading = 'LOADING',
  Error = 'ERROR',
}

export type SignUpViewModel = AuthBaseViewModel<SignUpViewState> & {
  error: string | null
}

export function selectSignUpViewModel(state: RootState): SignUpViewModel {
  const { isLoading, error } = state.auth
  const { Loading, Error, Idle } = SignUpViewState

  if (isLoading) {
    return {
      type: Loading,
      buttonText: 'CREATING ACCOUNT...',
      isInputDisabled: true,
      error: null,
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
    error: null,
  }
}

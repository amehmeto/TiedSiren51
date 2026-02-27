import { RootState } from '@/core/_redux_/createStore'
import { AuthBaseViewModel } from '@/ui/screens/Auth/auth-view-model-base'

export enum SignUpViewState {
  Idle = 'IDLE',
  Loading = 'LOADING',
  Error = 'ERROR',
}

export type SignUpViewModel = AuthBaseViewModel<SignUpViewState> & {
  error: string | null
  email: string
  password: string
}

export function selectSignUpViewModel(state: RootState): SignUpViewModel {
  const { isLoading, email, password } = state.auth
  const error = state.auth.error?.message ?? null
  const { Loading, Error, Idle } = SignUpViewState

  if (isLoading) {
    return {
      type: Loading,
      buttonText: 'CREATING ACCOUNT...',
      isInputDisabled: true,
      error: null,
      email,
      password,
    }
  }

  if (error) {
    return {
      type: Error,
      buttonText: 'CREATE YOUR ACCOUNT',
      isInputDisabled: false,
      error,
      email,
      password,
    }
  }

  return {
    type: Idle,
    buttonText: 'CREATE YOUR ACCOUNT',
    isInputDisabled: false,
    error: null,
    email,
    password,
  }
}

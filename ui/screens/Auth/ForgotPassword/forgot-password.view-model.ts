import { RootState } from '@/core/_redux_/createStore'
import {
  AuthBaseViewModel,
  AuthErrorViewModel,
} from '@/ui/screens/Auth/auth-view-model-base'

export enum ForgotPasswordViewState {
  Idle = 'IDLE',
  Loading = 'LOADING',
  Error = 'ERROR',
  Success = 'SUCCESS',
}

type SuccessViewModel = {
  type: ForgotPasswordViewState.Success
}

export type ForgotPasswordViewModel =
  | AuthBaseViewModel<ForgotPasswordViewState.Idle>
  | AuthBaseViewModel<ForgotPasswordViewState.Loading>
  | AuthErrorViewModel<ForgotPasswordViewState.Error>
  | SuccessViewModel

export function selectForgotPasswordViewModel(
  state: RootState,
): ForgotPasswordViewModel {
  const { isLoading, error, isPasswordResetSent } = state.auth
  const { Success, Loading, Error, Idle } = ForgotPasswordViewState

  if (isPasswordResetSent) {
    return {
      type: Success,
    }
  }

  if (isLoading) {
    return {
      type: Loading,
      buttonText: 'SENDING...',
      isInputDisabled: true,
    }
  }

  if (error) {
    return {
      type: Error,
      buttonText: 'SEND RESET LINK',
      isInputDisabled: false,
      error,
    }
  }

  return {
    type: Idle,
    buttonText: 'SEND RESET LINK',
    isInputDisabled: false,
  }
}

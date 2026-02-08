import { RootState } from '@/core/_redux_/createStore'

export enum ForgotPasswordViewState {
  Idle = 'IDLE',
  Loading = 'LOADING',
  Error = 'ERROR',
  Success = 'SUCCESS',
}

type IdleViewModel = {
  type: ForgotPasswordViewState.Idle
  buttonText: string
  isInputDisabled: boolean
}

type LoadingViewModel = {
  type: ForgotPasswordViewState.Loading
  buttonText: string
  isInputDisabled: boolean
}

type ErrorViewModel = {
  type: ForgotPasswordViewState.Error
  buttonText: string
  isInputDisabled: boolean
  error: string
}

type SuccessViewModel = {
  type: ForgotPasswordViewState.Success
}

export type ForgotPasswordViewModel =
  | IdleViewModel
  | LoadingViewModel
  | ErrorViewModel
  | SuccessViewModel

export function selectForgotPasswordViewModel(
  state: RootState,
): ForgotPasswordViewModel {
  const { isLoading, error, isPasswordResetSent } = state.auth

  if (isPasswordResetSent) {
    return {
      type: ForgotPasswordViewState.Success,
    }
  }

  if (isLoading) {
    return {
      type: ForgotPasswordViewState.Loading,
      buttonText: 'SENDING...',
      isInputDisabled: true,
    }
  }

  if (error) {
    return {
      type: ForgotPasswordViewState.Error,
      buttonText: 'SEND RESET LINK',
      isInputDisabled: false,
      error,
    }
  }

  return {
    type: ForgotPasswordViewState.Idle,
    buttonText: 'SEND RESET LINK',
    isInputDisabled: false,
  }
}

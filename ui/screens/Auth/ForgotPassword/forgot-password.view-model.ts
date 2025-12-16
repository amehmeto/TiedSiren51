import { RootState } from '@/core/_redux_/createStore'

export enum ForgotPasswordViewState {
  Form = 'FORM',
  Success = 'SUCCESS',
}

type FormViewModel = {
  type: ForgotPasswordViewState.Form
  isLoading: boolean
  error: string | null
  buttonText: string
  isInputDisabled: boolean
}

type SuccessViewModel = {
  type: ForgotPasswordViewState.Success
}

export type ForgotPasswordViewModel = FormViewModel | SuccessViewModel

export function selectForgotPasswordViewModel(
  state: RootState,
): ForgotPasswordViewModel {
  const { isLoading, error, isPasswordResetSent } = state.auth

  if (isPasswordResetSent) {
    return {
      type: ForgotPasswordViewState.Success,
    }
  }

  return {
    type: ForgotPasswordViewState.Form,
    isLoading,
    error,
    buttonText: isLoading ? 'SENDING...' : 'SEND RESET LINK',
    isInputDisabled: isLoading,
  }
}

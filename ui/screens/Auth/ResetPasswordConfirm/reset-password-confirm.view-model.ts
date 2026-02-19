import { RootState } from '@/core/_redux_/createStore'

export enum ResetPasswordConfirmViewState {
  Idle = 'IDLE',
  Loading = 'LOADING',
  Error = 'ERROR',
  Success = 'SUCCESS',
}

type SuccessViewModel = {
  type: ResetPasswordConfirmViewState.Success
}

type FormViewModel = {
  type: Exclude<
    ResetPasswordConfirmViewState,
    ResetPasswordConfirmViewState.Success
  >
  buttonText: string
  isInputDisabled: boolean
  error: string | null
}

export type ResetPasswordConfirmViewModel = FormViewModel | SuccessViewModel

export function selectResetPasswordConfirmViewModel(
  state: RootState,
): ResetPasswordConfirmViewModel {
  const {
    isConfirmingPasswordReset,
    confirmPasswordResetError,
    isPasswordResetConfirmed,
  } = state.auth
  const { Success, Loading, Error, Idle } = ResetPasswordConfirmViewState

  if (isPasswordResetConfirmed) return { type: Success }

  if (isConfirmingPasswordReset) {
    return {
      type: Loading,
      buttonText: 'RESETTING...',
      isInputDisabled: true,
      error: null,
    }
  }

  if (confirmPasswordResetError) {
    return {
      type: Error,
      buttonText: 'RESET PASSWORD',
      isInputDisabled: false,
      error: confirmPasswordResetError,
    }
  }

  return {
    type: Idle,
    buttonText: 'RESET PASSWORD',
    isInputDisabled: false,
    error: null,
  }
}

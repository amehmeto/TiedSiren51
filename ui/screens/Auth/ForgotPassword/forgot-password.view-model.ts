import { ISODateString } from '@/core/_ports_/date-provider'
import { RootState } from '@/core/_redux_/createStore'
import { AuthBaseViewModel } from '@/ui/screens/Auth/auth-view-model-base'

export enum ForgotPasswordViewState {
  Idle = 'IDLE',
  Loading = 'LOADING',
  Error = 'ERROR',
  Success = 'SUCCESS',
}

type SuccessViewModel = {
  type: ForgotPasswordViewState.Success
  lastPasswordResetRequestAt: ISODateString | null
}

type FormViewModel = AuthBaseViewModel<
  Exclude<ForgotPasswordViewState, ForgotPasswordViewState.Success>
> & {
  error: string | null
}

export type ForgotPasswordViewModel = FormViewModel | SuccessViewModel

export function selectForgotPasswordViewModel(
  state: RootState,
): ForgotPasswordViewModel {
  const { isLoading, error, isPasswordResetSent, lastPasswordResetRequestAt } =
    state.auth
  const { Success, Loading, Error, Idle } = ForgotPasswordViewState

  if (isPasswordResetSent) {
    return {
      type: Success,
      lastPasswordResetRequestAt,
    }
  }

  if (isLoading) {
    return {
      type: Loading,
      buttonText: 'SENDING...',
      isInputDisabled: true,
      error: null,
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
    error: null,
  }
}

import { ISODateString } from '@/core/_ports_/date-provider'
import { RootState } from '@/core/_redux_/createStore'
import { AuthBaseViewModel } from '@/ui/screens/Auth/auth-view-model-base'

// Client-side UX guard; Firebase enforces its own server-side rate limit
// (auth/too-many-requests) which is dynamic and not configurable.
const RESEND_COOLDOWN_SECONDS = 60

export enum ForgotPasswordViewState {
  Idle = 'IDLE',
  Loading = 'LOADING',
  Error = 'ERROR',
  Success = 'SUCCESS',
}

type SuccessViewModel = {
  type: ForgotPasswordViewState.Success
  lastPasswordResetRequestAt: ISODateString
  isResendDisabled: boolean
  resendButtonText: string
}

type FormViewModel = AuthBaseViewModel<
  Exclude<ForgotPasswordViewState, ForgotPasswordViewState.Success>
> & {
  error: string | null
}

export type ForgotPasswordViewModel = FormViewModel | SuccessViewModel

export function resendCooldownSecondsRemaining(
  lastRequestAt: ISODateString,
  now: number,
): number {
  const elapsedMs = now - new Date(lastRequestAt).getTime()
  const remaining = RESEND_COOLDOWN_SECONDS - Math.floor(elapsedMs / 1000)
  return Math.max(0, remaining)
}

function deriveResendState(
  lastPasswordResetRequestAt: ISODateString,
  now: number,
): Pick<SuccessViewModel, 'isResendDisabled' | 'resendButtonText'> {
  const remainingSeconds = resendCooldownSecondsRemaining(
    lastPasswordResetRequestAt,
    now,
  )
  const isResendDisabled = remainingSeconds > 0
  const resendButtonText = isResendDisabled
    ? `RESEND EMAIL (${remainingSeconds}s)`
    : 'RESEND EMAIL'
  return { isResendDisabled, resendButtonText }
}

export type ResendState = Pick<
  SuccessViewModel,
  'isResendDisabled' | 'resendButtonText'
>

export function selectResendState(state: RootState, now: number): ResendState {
  const { lastPasswordResetRequestAt } = state.auth
  return lastPasswordResetRequestAt
    ? deriveResendState(lastPasswordResetRequestAt, now)
    : { isResendDisabled: false, resendButtonText: 'RESEND EMAIL' }
}

export function selectForgotPasswordViewModel(
  state: RootState,
  now: number,
): ForgotPasswordViewModel {
  const { isLoading, lastPasswordResetRequestAt } = state.auth
  const error = state.auth.error?.message ?? null
  const { Success, Loading, Error, Idle } = ForgotPasswordViewState

  if (lastPasswordResetRequestAt) {
    return {
      type: Success,
      lastPasswordResetRequestAt,
      ...deriveResendState(lastPasswordResetRequestAt, now),
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

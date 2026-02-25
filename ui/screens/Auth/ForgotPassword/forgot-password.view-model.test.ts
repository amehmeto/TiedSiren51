import { describe, expect, it } from 'vitest'
import {
  assertISODateString,
  ISODateString,
} from '@/core/_ports_/date-provider'
import { stateBuilder } from '@/core/_tests_/state-builder'
import {
  ForgotPasswordViewModel,
  ForgotPasswordViewState,
  selectForgotPasswordViewModel,
  selectResendState,
} from './forgot-password.view-model'

function isoDateSecondsAgo(seconds: number, now: number): ISODateString {
  const isoString = new Date(now - seconds * 1000).toISOString()
  assertISODateString(isoString)
  return isoString
}

describe('selectForgotPasswordViewModel', () => {
  describe('Idle state', () => {
    it('should return idle view model when not loading and no error', () => {
      const state = stateBuilder().build()
      const expectedViewModel: ForgotPasswordViewModel = {
        type: ForgotPasswordViewState.Idle,
        buttonText: 'SEND RESET LINK',
        isInputDisabled: false,
        error: null,
      }

      const viewModel = selectForgotPasswordViewModel(state)

      expect(viewModel).toStrictEqual(expectedViewModel)
    })
  })

  describe('Loading state', () => {
    it('should return loading view model when auth is loading', () => {
      const state = stateBuilder().withAuthLoading(true).build()
      const expectedViewModel: ForgotPasswordViewModel = {
        type: ForgotPasswordViewState.Loading,
        buttonText: 'SENDING...',
        isInputDisabled: true,
        error: null,
      }

      const viewModel = selectForgotPasswordViewModel(state)

      expect(viewModel).toStrictEqual(expectedViewModel)
    })
  })

  describe('Error state', () => {
    it('should return error view model when error is present', () => {
      const state = stateBuilder()
        .withAuthError({ message: 'No account found' })
        .build()
      const expectedViewModel: ForgotPasswordViewModel = {
        type: ForgotPasswordViewState.Error,
        buttonText: 'SEND RESET LINK',
        isInputDisabled: false,
        error: 'No account found',
      }

      const viewModel = selectForgotPasswordViewModel(state)

      expect(viewModel).toStrictEqual(expectedViewModel)
    })
  })

  describe('Success state', () => {
    it('should return success view model when password reset was requested', () => {
      const requestedAt: ISODateString = '2024-01-15T10:00:00.000Z'
      const state = stateBuilder()
        .withLastPasswordResetRequestAt(requestedAt)
        .build()
      const expectedSuccessType = ForgotPasswordViewState.Success

      const viewModel = selectForgotPasswordViewModel(state)

      expect(viewModel.type).toBe(expectedSuccessType)
    })

    it('should disable resend button during cooldown', () => {
      const now = Date.now()
      const requestedTenSecondsAgo = isoDateSecondsAgo(10, now)
      const state = stateBuilder()
        .withLastPasswordResetRequestAt(requestedTenSecondsAgo)
        .build()
      const expectedViewModel = {
        type: ForgotPasswordViewState.Success,
        lastPasswordResetRequestAt: requestedTenSecondsAgo,
        isResendDisabled: true,
        resendButtonText: 'RESEND EMAIL (50s)',
      }

      const viewModel = selectForgotPasswordViewModel(state, now)

      expect(viewModel).toStrictEqual(expectedViewModel)
    })

    it('should enable resend button after cooldown expires', () => {
      const now = Date.now()
      const requestedTwoMinutesAgo = isoDateSecondsAgo(120, now)
      const state = stateBuilder()
        .withLastPasswordResetRequestAt(requestedTwoMinutesAgo)
        .build()
      const expectedViewModel = {
        type: ForgotPasswordViewState.Success,
        lastPasswordResetRequestAt: requestedTwoMinutesAgo,
        isResendDisabled: false,
        resendButtonText: 'RESEND EMAIL',
      }

      const viewModel = selectForgotPasswordViewModel(state, now)

      expect(viewModel).toStrictEqual(expectedViewModel)
    })
  })
})

describe('selectResendState', () => {
  it('should return enabled state when no password reset was requested', () => {
    const state = stateBuilder().build()
    const expectedResendState = {
      isResendDisabled: false,
      resendButtonText: 'RESEND EMAIL',
    }

    const resendState = selectResendState(state)

    expect(resendState).toStrictEqual(expectedResendState)
  })

  it('should return disabled state during cooldown', () => {
    const now = Date.now()
    const requestedTenSecondsAgo = isoDateSecondsAgo(10, now)
    const state = stateBuilder()
      .withLastPasswordResetRequestAt(requestedTenSecondsAgo)
      .build()
    const expectedResendState = {
      isResendDisabled: true,
      resendButtonText: 'RESEND EMAIL (50s)',
    }

    const resendState = selectResendState(state, now)

    expect(resendState).toStrictEqual(expectedResendState)
  })

  it('should return enabled state after cooldown expires', () => {
    const now = Date.now()
    const requestedTwoMinutesAgo = isoDateSecondsAgo(120, now)
    const state = stateBuilder()
      .withLastPasswordResetRequestAt(requestedTwoMinutesAgo)
      .build()
    const expectedResendState = {
      isResendDisabled: false,
      resendButtonText: 'RESEND EMAIL',
    }

    const resendState = selectResendState(state, now)

    expect(resendState).toStrictEqual(expectedResendState)
  })
})

import { describe, expect, it } from 'vitest'
import { stateBuilder } from '@/core/_tests_/state-builder'
import {
  ForgotPasswordViewState,
  selectForgotPasswordViewModel,
} from './forgot-password.view-model'

describe('selectForgotPasswordViewModel', () => {
  it('should return Form state when password reset not sent', () => {
    const state = stateBuilder().withPasswordResetSent(false).build()

    const viewModel = selectForgotPasswordViewModel(state)

    expect(viewModel.type).toBe(ForgotPasswordViewState.Form)
  })

  it('should return Success state when password reset sent', () => {
    const state = stateBuilder().withPasswordResetSent(true).build()

    const viewModel = selectForgotPasswordViewModel(state)

    expect(viewModel.type).toBe(ForgotPasswordViewState.Success)
  })

  it('should disable input when loading', () => {
    const state = stateBuilder().withAuthLoading(true).build()
    const expectedViewModel = {
      type: ForgotPasswordViewState.Form,
      isInputDisabled: true,
      buttonText: 'SENDING...',
    }

    const viewModel = selectForgotPasswordViewModel(state)

    expect(viewModel).toMatchObject(expectedViewModel)
  })

  it('should show error when present', () => {
    const state = stateBuilder().withAuthError('No account found').build()
    const expectedViewModel = {
      type: ForgotPasswordViewState.Form,
      error: 'No account found',
    }

    const viewModel = selectForgotPasswordViewModel(state)

    expect(viewModel).toMatchObject(expectedViewModel)
  })
})

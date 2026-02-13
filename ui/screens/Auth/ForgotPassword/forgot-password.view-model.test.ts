import { describe, expect, it } from 'vitest'
import { stateBuilder } from '@/core/_tests_/state-builder'
import {
  ForgotPasswordViewModel,
  ForgotPasswordViewState,
  selectForgotPasswordViewModel,
} from './forgot-password.view-model'

describe('selectForgotPasswordViewModel', () => {
  describe('Idle state', () => {
    it('should return idle view model when not loading and no error', () => {
      const state = stateBuilder().build()
      const expectedViewModel: ForgotPasswordViewModel = {
        type: ForgotPasswordViewState.Idle,
        buttonText: 'SEND RESET LINK',
        isInputDisabled: false,
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
    it('should return success view model when password reset sent', () => {
      const state = stateBuilder().withPasswordResetSent(true).build()
      const expectedViewModel: ForgotPasswordViewModel = {
        type: ForgotPasswordViewState.Success,
      }

      const viewModel = selectForgotPasswordViewModel(state)

      expect(viewModel).toStrictEqual(expectedViewModel)
    })
  })
})

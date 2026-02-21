import { describe, expect, it } from 'vitest'
import { stateBuilder } from '@/core/_tests_/state-builder'
import {
  ResetPasswordConfirmViewModel,
  ResetPasswordConfirmViewState,
  selectResetPasswordConfirmViewModel,
} from './reset-password-confirm.view-model'

describe('selectResetPasswordConfirmViewModel', () => {
  describe('Idle state', () => {
    it('should return idle view model when not loading and no error', () => {
      const state = stateBuilder().build()
      const expectedViewModel: ResetPasswordConfirmViewModel = {
        type: ResetPasswordConfirmViewState.Idle,
        buttonText: 'RESET PASSWORD',
        isInputDisabled: false,
        error: null,
      }

      const viewModel = selectResetPasswordConfirmViewModel(state)

      expect(viewModel).toStrictEqual(expectedViewModel)
    })
  })

  describe('Loading state', () => {
    it('should return loading view model when confirming password reset', () => {
      const state = stateBuilder().withConfirmingPasswordReset(true).build()
      const expectedViewModel: ResetPasswordConfirmViewModel = {
        type: ResetPasswordConfirmViewState.Loading,
        buttonText: 'RESETTING...',
        isInputDisabled: true,
        error: null,
      }

      const viewModel = selectResetPasswordConfirmViewModel(state)

      expect(viewModel).toStrictEqual(expectedViewModel)
    })
  })

  describe('Error state', () => {
    it('should return error view model when confirmation error is present', () => {
      const state = stateBuilder()
        .withConfirmPasswordResetError(
          'This password reset link has expired. Please request a new one.',
        )
        .build()
      const expectedViewModel: ResetPasswordConfirmViewModel = {
        type: ResetPasswordConfirmViewState.Error,
        buttonText: 'RESET PASSWORD',
        isInputDisabled: false,
        error:
          'This password reset link has expired. Please request a new one.',
      }

      const viewModel = selectResetPasswordConfirmViewModel(state)

      expect(viewModel).toStrictEqual(expectedViewModel)
    })
  })

  describe('Success state', () => {
    it('should return success view model when password reset is confirmed', () => {
      const state = stateBuilder().withPasswordResetConfirmed(true).build()
      const expectedViewModel: ResetPasswordConfirmViewModel = {
        type: ResetPasswordConfirmViewState.Success,
      }

      const viewModel = selectResetPasswordConfirmViewModel(state)

      expect(viewModel).toStrictEqual(expectedViewModel)
    })
  })
})

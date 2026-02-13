import { describe, expect, it } from 'vitest'
import { stateBuilder } from '@/core/_tests_/state-builder'
import {
  LoginViewModel,
  LoginViewState,
  selectLoginViewModel,
} from '@/ui/screens/Auth/Login/login.view-model'

describe('selectLoginViewModel', () => {
  describe('Idle state', () => {
    it('should return idle view model when not loading and no error', () => {
      const state = stateBuilder().build()
      const expectedViewModel: LoginViewModel = {
        type: LoginViewState.Idle,
        buttonText: 'LOG IN',
        isInputDisabled: false,
      }

      const viewModel = selectLoginViewModel(state)

      expect(viewModel).toStrictEqual(expectedViewModel)
    })
  })

  describe('Loading state', () => {
    it('should return loading view model when auth is loading', () => {
      const state = stateBuilder().withAuthLoading(true).build()
      const expectedViewModel: LoginViewModel = {
        type: LoginViewState.Loading,
        buttonText: 'LOGGING IN...',
        isInputDisabled: true,
      }

      const viewModel = selectLoginViewModel(state)

      expect(viewModel).toStrictEqual(expectedViewModel)
    })
  })

  describe('Error state', () => {
    it('should return error view model with shouldClearPassword true when password clear requested', () => {
      const state = stateBuilder()
        .withAuthError('Invalid email or password.')
        .withPasswordClearRequested(true)
        .build()
      const expectedViewModel: LoginViewModel = {
        type: LoginViewState.Error,
        buttonText: 'LOG IN',
        isInputDisabled: false,
        error: 'Invalid email or password.',
        shouldClearPassword: true,
      }

      const viewModel = selectLoginViewModel(state)

      expect(viewModel).toStrictEqual(expectedViewModel)
    })

    it('should return error view model with shouldClearPassword false when no password clear requested', () => {
      const state = stateBuilder()
        .withAuthError(
          'No internet connection. Please check your network and try again.',
        )
        .build()
      const expectedViewModel: LoginViewModel = {
        type: LoginViewState.Error,
        buttonText: 'LOG IN',
        isInputDisabled: false,
        error:
          'No internet connection. Please check your network and try again.',
        shouldClearPassword: false,
      }

      const viewModel = selectLoginViewModel(state)

      expect(viewModel).toStrictEqual(expectedViewModel)
    })
  })
})

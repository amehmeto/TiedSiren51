import { describe, expect, it } from 'vitest'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { AuthErrorType } from '@/core/auth/auth-error-type'
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
        error: null,
        email: '',
        password: '',
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
        error: null,
        email: '',
        password: '',
      }

      const viewModel = selectLoginViewModel(state)

      expect(viewModel).toStrictEqual(expectedViewModel)
    })
  })

  describe('Error state', () => {
    it('should return error view model with email preserved and password cleared on credential error', () => {
      const state = stateBuilder()
        .withAuthError({
          message: 'Invalid email or password.',
          errorType: AuthErrorType.Credential,
        })
        .withEmail('user@test.com')
        .build()
      const expectedViewModel: LoginViewModel = {
        type: LoginViewState.Error,
        buttonText: 'LOG IN',
        isInputDisabled: false,
        error: 'Invalid email or password.',
        email: 'user@test.com',
        password: '',
      }

      const viewModel = selectLoginViewModel(state)

      expect(viewModel).toStrictEqual(expectedViewModel)
    })

    it('should return error view model with email and password preserved on network error', () => {
      const state = stateBuilder()
        .withAuthError({
          message:
            'No internet connection. Please check your network and try again.',
        })
        .withEmail('user@test.com')
        .withPassword('mypassword')
        .build()
      const expectedViewModel: LoginViewModel = {
        type: LoginViewState.Error,
        buttonText: 'LOG IN',
        isInputDisabled: false,
        error:
          'No internet connection. Please check your network and try again.',
        email: 'user@test.com',
        password: 'mypassword',
      }

      const viewModel = selectLoginViewModel(state)

      expect(viewModel).toStrictEqual(expectedViewModel)
    })
  })
})

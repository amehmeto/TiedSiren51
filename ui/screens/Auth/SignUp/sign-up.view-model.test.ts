import { describe, expect, it } from 'vitest'
import { stateBuilder } from '@/core/_tests_/state-builder'
import {
  SignUpViewModel,
  SignUpViewState,
  selectSignUpViewModel,
} from '@/ui/screens/Auth/SignUp/sign-up.view-model'

describe('selectSignUpViewModel', () => {
  describe('Idle state', () => {
    it('should return idle view model when not loading and no error', () => {
      const state = stateBuilder().build()
      const expectedViewModel: SignUpViewModel = {
        type: SignUpViewState.Idle,
        buttonText: 'CREATE YOUR ACCOUNT',
        isInputDisabled: false,
        error: null,
        email: '',
        password: '',
      }

      const viewModel = selectSignUpViewModel(state)

      expect(viewModel).toStrictEqual(expectedViewModel)
    })
  })

  describe('Loading state', () => {
    it('should return loading view model when auth is loading', () => {
      const state = stateBuilder().withAuthLoading(true).build()
      const expectedViewModel: SignUpViewModel = {
        type: SignUpViewState.Loading,
        buttonText: 'CREATING ACCOUNT...',
        isInputDisabled: true,
        error: null,
        email: '',
        password: '',
      }

      const viewModel = selectSignUpViewModel(state)

      expect(viewModel).toStrictEqual(expectedViewModel)
    })
  })

  describe('Error state', () => {
    it.each<[string, string]>([
      ['email already in use', 'Invalid email or password.'],
      ['weak password', 'Password must be at least 6 characters.'],
      [
        'network error',
        'No internet connection. Please check your network and try again.',
      ],
    ])('should return error view model for %s', (_scenario, errorMessage) => {
      const state = stateBuilder()
        .withAuthError({ message: errorMessage })
        .build()
      const expectedViewModel: SignUpViewModel = {
        type: SignUpViewState.Error,
        buttonText: 'CREATE YOUR ACCOUNT',
        isInputDisabled: false,
        error: errorMessage,
        email: '',
        password: '',
      }

      const viewModel = selectSignUpViewModel(state)

      expect(viewModel).toStrictEqual(expectedViewModel)
    })
  })
})

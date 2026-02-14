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
    it('should return error view model for email already in use', () => {
      const state = stateBuilder()
        .withAuthError({ message: 'This email is already in use.' })
        .build()
      const expectedViewModel: SignUpViewModel = {
        type: SignUpViewState.Error,
        buttonText: 'CREATE YOUR ACCOUNT',
        isInputDisabled: false,
        error: 'This email is already in use.',
        email: '',
        password: '',
      }

      const viewModel = selectSignUpViewModel(state)

      expect(viewModel).toStrictEqual(expectedViewModel)
    })

    it('should return error view model for weak password', () => {
      const state = stateBuilder()
        .withAuthError({ message: 'Password must be at least 6 characters.' })
        .build()
      const expectedViewModel: SignUpViewModel = {
        type: SignUpViewState.Error,
        buttonText: 'CREATE YOUR ACCOUNT',
        isInputDisabled: false,
        error: 'Password must be at least 6 characters.',
        email: '',
        password: '',
      }

      const viewModel = selectSignUpViewModel(state)

      expect(viewModel).toStrictEqual(expectedViewModel)
    })

    it('should return error view model for network error', () => {
      const state = stateBuilder()
        .withAuthError({
          message:
            'No internet connection. Please check your network and try again.',
        })
        .build()
      const expectedViewModel: SignUpViewModel = {
        type: SignUpViewState.Error,
        buttonText: 'CREATE YOUR ACCOUNT',
        isInputDisabled: false,
        error:
          'No internet connection. Please check your network and try again.',
        email: '',
        password: '',
      }

      const viewModel = selectSignUpViewModel(state)

      expect(viewModel).toStrictEqual(expectedViewModel)
    })
  })
})

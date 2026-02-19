import { describe, expect, test } from 'vitest'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { AuthProvider } from '@/core/auth/auth-user'
import {
  EmailVerificationBannerViewState,
  selectEmailVerificationBannerViewModel,
} from './email-verification-banner.view-model'

describe('selectEmailVerificationBannerViewModel', () => {
  test('should return Hidden when no user is authenticated', () => {
    const state = stateBuilder().withoutAuthUser({}).build()
    const expectedViewModel = {
      type: EmailVerificationBannerViewState.Hidden,
    }

    const viewModel = selectEmailVerificationBannerViewModel(state)

    expect(viewModel).toStrictEqual(expectedViewModel)
  })

  test('should return Hidden when user email is verified', () => {
    const state = stateBuilder()
      .withAuthUser({
        id: 'user-123',
        email: 'test@example.com',
        isEmailVerified: true,
        authProvider: AuthProvider.Email,
      })
      .build()
    const expectedViewModel = {
      type: EmailVerificationBannerViewState.Hidden,
    }

    const viewModel = selectEmailVerificationBannerViewModel(state)

    expect(viewModel).toStrictEqual(expectedViewModel)
  })

  test('should return Hidden for Google-authenticated users', () => {
    const state = stateBuilder()
      .withAuthUser({
        id: 'user-123',
        email: 'test@example.com',
        isEmailVerified: false,
        authProvider: AuthProvider.Google,
      })
      .build()
    const expectedViewModel = {
      type: EmailVerificationBannerViewState.Hidden,
    }

    const viewModel = selectEmailVerificationBannerViewModel(state)

    expect(viewModel).toStrictEqual(expectedViewModel)
  })

  test('should return Hidden for Apple-authenticated users', () => {
    const state = stateBuilder()
      .withAuthUser({
        id: 'user-123',
        email: 'test@example.com',
        isEmailVerified: false,
        authProvider: AuthProvider.Apple,
      })
      .build()
    const expectedViewModel = {
      type: EmailVerificationBannerViewState.Hidden,
    }

    const viewModel = selectEmailVerificationBannerViewModel(state)

    expect(viewModel).toStrictEqual(expectedViewModel)
  })

  test('should return Visible for unverified email user', () => {
    const state = stateBuilder()
      .withAuthUser({
        id: 'user-123',
        email: 'test@example.com',
        isEmailVerified: false,
        authProvider: AuthProvider.Email,
      })
      .build()
    const expectedViewModel = {
      type: EmailVerificationBannerViewState.Visible,
    }

    const viewModel = selectEmailVerificationBannerViewModel(state)

    expect(viewModel).toStrictEqual(expectedViewModel)
  })
})

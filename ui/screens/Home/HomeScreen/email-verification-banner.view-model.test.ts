import { describe, expect, test } from 'vitest'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { AuthProvider } from '@/core/auth/auth-user'
import { selectEmailVerificationBannerViewModel } from './email-verification-banner.view-model'

describe('selectEmailVerificationBannerViewModel', () => {
  test('should return hidden when no user is authenticated', () => {
    const state = stateBuilder().withoutAuthUser({}).build()
    const expectedViewModel = { visible: false }

    const viewModel = selectEmailVerificationBannerViewModel(state)

    expect(viewModel).toStrictEqual(expectedViewModel)
  })

  test('should return hidden when user email is verified', () => {
    const state = stateBuilder()
      .withAuthUser({
        id: 'user-123',
        email: 'test@example.com',
        isEmailVerified: true,
        authProvider: AuthProvider.Email,
      })
      .build()
    const expectedViewModel = { visible: false }

    const viewModel = selectEmailVerificationBannerViewModel(state)

    expect(viewModel).toStrictEqual(expectedViewModel)
  })

  test('should return hidden for Google-authenticated users', () => {
    const state = stateBuilder()
      .withAuthUser({
        id: 'user-123',
        email: 'test@example.com',
        isEmailVerified: false,
        authProvider: AuthProvider.Google,
      })
      .build()
    const expectedViewModel = { visible: false }

    const viewModel = selectEmailVerificationBannerViewModel(state)

    expect(viewModel).toStrictEqual(expectedViewModel)
  })

  test('should return hidden for Apple-authenticated users', () => {
    const state = stateBuilder()
      .withAuthUser({
        id: 'user-123',
        email: 'test@example.com',
        isEmailVerified: false,
        authProvider: AuthProvider.Apple,
      })
      .build()
    const expectedViewModel = { visible: false }

    const viewModel = selectEmailVerificationBannerViewModel(state)

    expect(viewModel).toStrictEqual(expectedViewModel)
  })

  test('should return visible with resend label for unverified email user', () => {
    const state = stateBuilder()
      .withAuthUser({
        id: 'user-123',
        email: 'test@example.com',
        isEmailVerified: false,
        authProvider: AuthProvider.Email,
      })
      .build()
    const expectedViewModel = {
      visible: true,
      isSendingVerificationEmail: false,
      resendVerificationEmailLabel: 'Resend Verification Email',
      userEmail: 'test@example.com',
    }

    const viewModel = selectEmailVerificationBannerViewModel(state)

    expect(viewModel).toStrictEqual(expectedViewModel)
  })

  test('should show sending label while verification email is being sent', () => {
    const state = stateBuilder()
      .withAuthUser({
        id: 'user-123',
        email: 'test@example.com',
        isEmailVerified: false,
        authProvider: AuthProvider.Email,
      })
      .withSendingVerificationEmail(true)
      .build()
    const expectedViewModel = {
      visible: true,
      isSendingVerificationEmail: true,
      resendVerificationEmailLabel: 'Sending...',
      userEmail: 'test@example.com',
    }

    const viewModel = selectEmailVerificationBannerViewModel(state)

    expect(viewModel).toStrictEqual(expectedViewModel)
  })
})

import { describe, expect, it } from 'vitest'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { AuthProvider } from '@/core/auth/auth-user'
import { selectSettingsViewModel } from './settings.view-model'

describe('selectSettingsViewModel', () => {
  it('should return email and password provider for email auth user', () => {
    const state = stateBuilder()
      .withAuthUser({
        id: 'user-id',
        email: 'user@test.com',
        isEmailVerified: true,
        authProvider: AuthProvider.Email,
      })
      .build()
    const expectedViewModel = {
      email: 'user@test.com',
      authProviderLabel: 'Password',
      hasPasswordProvider: true,
      showResendVerificationEmail: false,
    }

    const viewModel = selectSettingsViewModel(state)

    expect(viewModel).toStrictEqual(expectedViewModel)
  })

  it('should show resend verification email for unverified email user', () => {
    const state = stateBuilder()
      .withAuthUser({
        id: 'user-id',
        email: 'user@test.com',
        isEmailVerified: false,
        authProvider: AuthProvider.Email,
      })
      .build()
    const expectedViewModel = {
      email: 'user@test.com',
      authProviderLabel: 'Password',
      hasPasswordProvider: true,
      showResendVerificationEmail: true,
    }

    const viewModel = selectSettingsViewModel(state)

    expect(viewModel).toStrictEqual(expectedViewModel)
  })

  it('should return Google provider label for Google auth user', () => {
    const state = stateBuilder()
      .withAuthUser({
        id: 'user-id',
        email: 'user@gmail.com',
        isEmailVerified: true,
        authProvider: AuthProvider.Google,
      })
      .build()
    const expectedViewModel = {
      email: 'user@gmail.com',
      authProviderLabel: 'Google',
      hasPasswordProvider: false,
      showResendVerificationEmail: false,
    }

    const viewModel = selectSettingsViewModel(state)

    expect(viewModel).toStrictEqual(expectedViewModel)
  })

  it('should return Apple provider label for Apple auth user', () => {
    const state = stateBuilder()
      .withAuthUser({
        id: 'user-id',
        email: 'user@icloud.com',
        isEmailVerified: true,
        authProvider: AuthProvider.Apple,
      })
      .build()
    const expectedViewModel = {
      email: 'user@icloud.com',
      authProviderLabel: 'Apple',
      hasPasswordProvider: false,
      showResendVerificationEmail: false,
    }

    const viewModel = selectSettingsViewModel(state)

    expect(viewModel).toStrictEqual(expectedViewModel)
  })

  it('should default to Password provider when authProvider is undefined', () => {
    const state = stateBuilder()
      .withAuthUser({
        id: 'user-id',
        email: 'user@test.com',
        isEmailVerified: true,
      })
      .build()
    const expectedViewModel = {
      email: 'user@test.com',
      authProviderLabel: 'Password',
      hasPasswordProvider: true,
      showResendVerificationEmail: false,
    }

    const viewModel = selectSettingsViewModel(state)

    expect(viewModel).toStrictEqual(expectedViewModel)
  })

  it('should return empty email when no auth user', () => {
    const state = stateBuilder().build()
    const expectedViewModel = {
      email: '',
      authProviderLabel: 'Password',
      hasPasswordProvider: true,
      showResendVerificationEmail: false,
    }

    const viewModel = selectSettingsViewModel(state)

    expect(viewModel).toStrictEqual(expectedViewModel)
  })
})

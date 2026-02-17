import { beforeEach, describe, expect, it } from 'vitest'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'
import { selectChangePasswordViewModel } from './change-password.view-model'

describe('selectChangePasswordViewModel', () => {
  let dateProvider: StubDateProvider

  beforeEach(() => {
    dateProvider = new StubDateProvider()
    dateProvider.now = new Date('2026-02-15T20:03:00.000Z')
  })

  it('should return default state', () => {
    const state = stateBuilder()
      .withAuthUser({
        id: 'user-id',
        email: 'user@test.com',
        isEmailVerified: true,
      })
      .build()
    const expectedViewModel = {
      isReauthenticated: false,
      isChangingPassword: false,
      changePasswordError: null,
      hasChangePasswordSucceeded: false,
      changePasswordSuccessCount: 0,
      buttonText: 'Change Password',
    }

    const viewModel = selectChangePasswordViewModel(state, dateProvider)

    expect(viewModel).toStrictEqual(expectedViewModel)
  })

  it('should mark as reauthed when lastReauthenticatedAt is within 5 minutes', () => {
    const state = stateBuilder()
      .withAuthUser({
        id: 'user-id',
        email: 'user@test.com',
        isEmailVerified: true,
      })
      .withLastReauthenticatedAt('2026-02-15T20:00:00.000Z')
      .build()
    const expectedViewModel = { isReauthenticated: true }

    const viewModel = selectChangePasswordViewModel(state, dateProvider)

    expect(viewModel).toMatchObject(expectedViewModel)
  })

  it('should return loading state when changing password', () => {
    const state = stateBuilder()
      .withAuthUser({
        id: 'user-id',
        email: 'user@test.com',
        isEmailVerified: true,
      })
      .withChangingPassword(true)
      .build()
    const expectedViewModel = {
      isChangingPassword: true,
      buttonText: 'Changing...',
    }

    const viewModel = selectChangePasswordViewModel(state, dateProvider)

    expect(viewModel).toMatchObject(expectedViewModel)
  })

  it('should show error when password change fails', () => {
    const state = stateBuilder()
      .withAuthUser({
        id: 'user-id',
        email: 'user@test.com',
        isEmailVerified: true,
      })
      .withChangePasswordError('Password is too weak.')
      .build()
    const expectedViewModel = {
      changePasswordError: 'Password is too weak.',
    }

    const viewModel = selectChangePasswordViewModel(state, dateProvider)

    expect(viewModel).toMatchObject(expectedViewModel)
  })

  it('should show success when password change succeeds', () => {
    const state = stateBuilder()
      .withAuthUser({
        id: 'user-id',
        email: 'user@test.com',
        isEmailVerified: true,
      })
      .withHasChangePasswordSucceeded(true)
      .build()
    const expectedViewModel = {
      hasChangePasswordSucceeded: true,
    }

    const viewModel = selectChangePasswordViewModel(state, dateProvider)

    expect(viewModel).toMatchObject(expectedViewModel)
  })
})

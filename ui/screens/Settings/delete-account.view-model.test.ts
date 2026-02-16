import { beforeEach, describe, expect, it } from 'vitest'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'
import {
  DeleteAccountViewState,
  selectDeleteAccountViewModel,
} from './delete-account.view-model'

describe('selectDeleteAccountViewModel', () => {
  let dateProvider: StubDateProvider

  beforeEach(() => {
    dateProvider = new StubDateProvider()
    dateProvider.now = new Date('2026-02-15T20:03:00.000Z')
  })

  it('should return Form state when user is authenticated', () => {
    const state = stateBuilder()
      .withAuthUser({
        id: 'user-id',
        email: 'user@test.com',
        isEmailVerified: true,
      })
      .build()
    const expectedViewModel = {
      type: DeleteAccountViewState.Form,
      isReauthenticated: false,
      isDeletingAccount: false,
      deleteAccountError: null,
      confirmText: '',
      isConfirmed: false,
      buttonText: 'Delete My Account',
      isDeleteDisabled: true,
    }

    const viewModel = selectDeleteAccountViewModel(state, dateProvider)

    expect(viewModel).toStrictEqual(expectedViewModel)
  })

  it('should return Deleted state when user is null', () => {
    const state = stateBuilder().build()

    const viewModel = selectDeleteAccountViewModel(state, dateProvider)

    expect(viewModel.type).toBe(DeleteAccountViewState.Deleted)
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
    const expectedViewModel = {
      type: DeleteAccountViewState.Form,
      isReauthenticated: true,
    }

    const viewModel = selectDeleteAccountViewModel(state, dateProvider)

    expect(viewModel).toMatchObject(expectedViewModel)
  })

  it('should mark as not reauthed when lastReauthenticatedAt is older than 5 minutes', () => {
    const state = stateBuilder()
      .withAuthUser({
        id: 'user-id',
        email: 'user@test.com',
        isEmailVerified: true,
      })
      .withLastReauthenticatedAt('2026-02-15T19:57:00.000Z')
      .build()
    const expectedViewModel = {
      type: DeleteAccountViewState.Form,
      isReauthenticated: false,
    }

    const viewModel = selectDeleteAccountViewModel(state, dateProvider)

    expect(viewModel).toMatchObject(expectedViewModel)
  })

  it('should return loading state when deleting', () => {
    const state = stateBuilder()
      .withAuthUser({
        id: 'user-id',
        email: 'user@test.com',
        isEmailVerified: true,
      })
      .withDeletingAccount(true)
      .build()
    const expectedViewModel = {
      type: DeleteAccountViewState.Form,
      isDeletingAccount: true,
      buttonText: 'Deleting...',
      isDeleteDisabled: true,
    }

    const viewModel = selectDeleteAccountViewModel(state, dateProvider)

    expect(viewModel).toMatchObject(expectedViewModel)
  })

  it('should show error when deletion fails', () => {
    const state = stateBuilder()
      .withAuthUser({
        id: 'user-id',
        email: 'user@test.com',
        isEmailVerified: true,
      })
      .withDeleteAccountError('Please re-authenticate to perform this action.')
      .build()
    const expectedViewModel = {
      type: DeleteAccountViewState.Form,
      deleteAccountError: 'Please re-authenticate to perform this action.',
    }

    const viewModel = selectDeleteAccountViewModel(state, dateProvider)

    expect(viewModel).toMatchObject(expectedViewModel)
  })

  it('should enable delete button when confirmation text matches', () => {
    const state = stateBuilder()
      .withAuthUser({
        id: 'user-id',
        email: 'user@test.com',
        isEmailVerified: true,
      })
      .withDeleteConfirmText('DELETE')
      .build()
    const expectedViewModel = {
      type: DeleteAccountViewState.Form,
      confirmText: 'DELETE',
      isConfirmed: true,
      isDeleteDisabled: false,
    }

    const viewModel = selectDeleteAccountViewModel(state, dateProvider)

    expect(viewModel).toMatchObject(expectedViewModel)
  })

  it('should keep delete button disabled when confirmation text does not match', () => {
    const state = stateBuilder()
      .withAuthUser({
        id: 'user-id',
        email: 'user@test.com',
        isEmailVerified: true,
      })
      .withDeleteConfirmText('DELE')
      .build()
    const expectedViewModel = {
      type: DeleteAccountViewState.Form,
      confirmText: 'DELE',
      isConfirmed: false,
      isDeleteDisabled: true,
    }

    const viewModel = selectDeleteAccountViewModel(state, dateProvider)

    expect(viewModel).toMatchObject(expectedViewModel)
  })

  it('should keep delete button disabled while deleting even if confirmed', () => {
    const state = stateBuilder()
      .withAuthUser({
        id: 'user-id',
        email: 'user@test.com',
        isEmailVerified: true,
      })
      .withDeleteConfirmText('DELETE')
      .withDeletingAccount(true)
      .build()
    const expectedViewModel = {
      type: DeleteAccountViewState.Form,
      isConfirmed: true,
      isDeleteDisabled: true,
      buttonText: 'Deleting...',
    }

    const viewModel = selectDeleteAccountViewModel(state, dateProvider)

    expect(viewModel).toMatchObject(expectedViewModel)
  })
})

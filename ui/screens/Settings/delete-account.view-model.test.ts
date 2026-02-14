import { describe, expect, it } from 'vitest'
import { stateBuilder } from '@/core/_tests_/state-builder'
import {
  DeleteAccountViewState,
  selectDeleteAccountViewModel,
} from './delete-account.view-model'

describe('selectDeleteAccountViewModel', () => {
  it('should return Form state when user is authenticated', () => {
    const state = stateBuilder()
      .withAuthUser({ id: 'user-id', email: 'user@test.com' })
      .build()

    const viewModel = selectDeleteAccountViewModel(state)

    expect(viewModel.type).toBe(DeleteAccountViewState.Form)
  })

  it('should return Deleted state when user is null', () => {
    const state = stateBuilder().build()

    const viewModel = selectDeleteAccountViewModel(state)

    expect(viewModel.type).toBe(DeleteAccountViewState.Deleted)
  })

  it('should return loading state when deleting', () => {
    const state = stateBuilder()
      .withAuthUser({ id: 'user-id', email: 'user@test.com' })
      .withDeletingAccount(true)
      .build()
    const expectedViewModel = {
      type: DeleteAccountViewState.Form,
      isDeletingAccount: true,
    }

    const viewModel = selectDeleteAccountViewModel(state)

    expect(viewModel).toMatchObject(expectedViewModel)
  })

  it('should show error when deletion fails', () => {
    const state = stateBuilder()
      .withAuthUser({ id: 'user-id', email: 'user@test.com' })
      .withDeleteAccountError('Please re-authenticate to perform this action.')
      .build()
    const expectedViewModel = {
      type: DeleteAccountViewState.Form,
      deleteAccountError: 'Please re-authenticate to perform this action.',
    }

    const viewModel = selectDeleteAccountViewModel(state)

    expect(viewModel).toMatchObject(expectedViewModel)
  })
})

import { describe, expect, test } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { selectDeleteAccountStatus } from './selectDeleteAccountStatus'

describe('selectDeleteAccountStatus', () => {
  test('should return default delete account status', () => {
    const store = createTestStore({}, stateBuilder().build())

    const { isDeletingAccount, deleteAccountError } = selectDeleteAccountStatus(
      store.getState(),
    )

    expect(isDeletingAccount).toBe(false)
    expect(deleteAccountError).toBeNull()
  })

  test('should return loading state when deleting account', () => {
    const store = createTestStore(
      {},
      stateBuilder().withDeletingAccount(true).build(),
    )

    const { isDeletingAccount } = selectDeleteAccountStatus(store.getState())

    expect(isDeletingAccount).toBe(true)
  })

  test('should return error when account deletion fails', () => {
    const store = createTestStore(
      {},
      stateBuilder()
        .withDeleteAccountError(
          'Please re-authenticate to perform this action.',
        )
        .build(),
    )

    const { deleteAccountError } = selectDeleteAccountStatus(store.getState())

    expect(deleteAccountError).toBe(
      'Please re-authenticate to perform this action.',
    )
  })
})

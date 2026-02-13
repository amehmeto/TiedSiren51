import { describe, expect, test } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { selectReauthStatus } from './selectReauthStatus'

describe('selectReauthStatus', () => {
  test('should return default reauth status', () => {
    const store = createTestStore({}, stateBuilder().build())

    const { isReauthenticating, reauthError } = selectReauthStatus(
      store.getState(),
    )

    expect(isReauthenticating).toBe(false)
    expect(reauthError).toBeNull()
  })

  test('should return loading state when re-authenticating', () => {
    const store = createTestStore(
      {},
      stateBuilder().withReauthenticating(true).build(),
    )

    const { isReauthenticating } = selectReauthStatus(store.getState())

    expect(isReauthenticating).toBe(true)
  })

  test('should return error when re-authentication fails', () => {
    const store = createTestStore(
      {},
      stateBuilder().withReauthError('Incorrect password.').build(),
    )

    const { reauthError } = selectReauthStatus(store.getState())

    expect(reauthError).toBe('Incorrect password.')
  })
})

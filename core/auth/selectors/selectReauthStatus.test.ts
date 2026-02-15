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
    const stateWithReauthenticating = stateBuilder()
      .withReauthenticating(true)
      .build()
    const store = createTestStore({}, stateWithReauthenticating)

    const { isReauthenticating } = selectReauthStatus(store.getState())

    expect(isReauthenticating).toBe(true)
  })

  test('should return error when re-authentication fails', () => {
    const stateWithReauthError = stateBuilder()
      .withReauthError('Incorrect password.')
      .build()
    const store = createTestStore({}, stateWithReauthError)

    const { reauthError } = selectReauthStatus(store.getState())

    expect(reauthError).toBe('Incorrect password.')
  })
})

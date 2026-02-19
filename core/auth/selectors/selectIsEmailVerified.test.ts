import { describe, expect, test } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { selectIsEmailVerified } from './selectIsEmailVerified'

describe('selectIsEmailVerified', () => {
  test('should return false when no user is authenticated', () => {
    const store = createTestStore(
      {},
      stateBuilder().withoutAuthUser({}).build(),
      { isAuthDefaultSkipped: true },
    )

    const isVerified = selectIsEmailVerified(store.getState())

    expect(isVerified).toBe(false)
  })

  test('should return false when user email is not verified', () => {
    const store = createTestStore(
      {},
      stateBuilder()
        .withAuthUser({
          id: 'user-123',
          email: 'test@example.com',
          isEmailVerified: false,
        })
        .build(),
    )

    const isVerified = selectIsEmailVerified(store.getState())

    expect(isVerified).toBe(false)
  })

  test('should return true when user email is verified', () => {
    const store = createTestStore(
      {},
      stateBuilder()
        .withAuthUser({
          id: 'user-123',
          email: 'test@example.com',
          isEmailVerified: true,
        })
        .build(),
    )

    const isVerified = selectIsEmailVerified(store.getState())

    expect(isVerified).toBe(true)
  })
})

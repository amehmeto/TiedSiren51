import { describe, expect, test } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { selectIsUserAuthenticated } from './selectIsUserAuthenticated'

describe('selectIsUserAuthenticated', () => {
  test('should return false when user is not authenticated', () => {
    const store = createTestStore(
      {},
      stateBuilder().withoutAuthUser({}).build(),
    )

    const isAuthenticated = selectIsUserAuthenticated(store.getState())

    expect(isAuthenticated).toBe(false)
  })

  test('should return true when user is authenticated', () => {
    const store = createTestStore(
      {},
      stateBuilder()
        .withAuthUser({
          id: 'user-123',
          email: 'test@example.com',
          username: 'testuser',
        })
        .build(),
    )

    const isAuthenticated = selectIsUserAuthenticated(store.getState())

    expect(isAuthenticated).toBe(true)
  })

  test('should return true when user is authenticated without optional fields', () => {
    const store = createTestStore(
      {},
      stateBuilder()
        .withAuthUser({
          id: 'user-456',
          email: 'another@example.com',
        })
        .build(),
    )

    const isAuthenticated = selectIsUserAuthenticated(store.getState())

    expect(isAuthenticated).toBe(true)
  })
})

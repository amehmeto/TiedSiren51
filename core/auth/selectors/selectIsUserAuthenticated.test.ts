import { describe, expect, test } from 'vitest'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { selectIsUserAuthenticated } from './selectIsUserAuthenticated'

describe('selectIsUserAuthenticated', () => {
  test('should return false when user is not authenticated', () => {
    const state = stateBuilder().withoutAuthUser({}).build()

    const isAuthenticated = selectIsUserAuthenticated(state)

    expect(isAuthenticated).toBe(false)
  })

  test('should return true when user is authenticated', () => {
    const state = stateBuilder()
      .withAuthUser({
        id: 'user-123',
        email: 'test@example.com',
        isEmailVerified: true,
        username: 'testuser',
      })
      .build()

    const isAuthenticated = selectIsUserAuthenticated(state)

    expect(isAuthenticated).toBe(true)
  })

  test('should return true when user is authenticated without optional fields', () => {
    const state = stateBuilder()
      .withAuthUser({
        id: 'user-456',
        email: 'another@example.com',
        isEmailVerified: true,
      })
      .build()

    const isAuthenticated = selectIsUserAuthenticated(state)

    expect(isAuthenticated).toBe(true)
  })
})

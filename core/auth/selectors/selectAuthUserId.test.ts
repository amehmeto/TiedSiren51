import { describe, expect, test } from 'vitest'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { AuthProvider } from '@/core/auth/auth-user'
import { selectAuthUserId } from './selectAuthUserId'

describe('selectAuthUserId', () => {
  test('should return user id when user is authenticated', () => {
    const state = stateBuilder()
      .withAuthUser({
        id: 'user-123',
        email: 'test@example.com',
        isEmailVerified: true,
        authProvider: AuthProvider.Email,
      })
      .build()

    const userId = selectAuthUserId(state)

    expect(userId).toBe('user-123')
  })

  test('should throw error when user is not authenticated', () => {
    const state = stateBuilder().withoutAuthUser({}).build()

    expect(() => selectAuthUserId(state)).toThrow('User not authenticated')
  })
})

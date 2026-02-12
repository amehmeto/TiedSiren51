import { describe, expect, test } from 'vitest'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { selectNullableAuthUserId } from './selectNullableAuthUserId'

describe('selectNullableAuthUserId', () => {
  test('should return user id when user is authenticated', () => {
    const state = stateBuilder()
      .withAuthUser({
        id: 'user-123',
        email: 'test@example.com',
      })
      .build()

    const userId = selectNullableAuthUserId(state)

    expect(userId).toBe('user-123')
  })

  test('should return null when user is not authenticated', () => {
    const state = stateBuilder().withoutAuthUser({}).build()

    const userId = selectNullableAuthUserId(state)

    expect(userId).toBeNull()
  })
})

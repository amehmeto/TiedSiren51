import { describe, expect, test } from 'vitest'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { selectAuthUserIdOrNull } from './selectAuthUserIdOrNull'

describe('selectAuthUserIdOrNull', () => {
  test('should return user id when user is authenticated', () => {
    const state = stateBuilder()
      .withAuthUser({
        id: 'user-123',
        email: 'test@example.com',
      })
      .build()

    const userId = selectAuthUserIdOrNull(state)

    expect(userId).toBe('user-123')
  })

  test('should return null when user is not authenticated', () => {
    const state = stateBuilder().withoutAuthUser({}).build()

    const userId = selectAuthUserIdOrNull(state)

    expect(userId).toBeNull()
  })
})

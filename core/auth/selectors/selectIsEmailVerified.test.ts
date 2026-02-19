import { describe, expect, test } from 'vitest'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { selectIsEmailVerified } from './selectIsEmailVerified'

describe('selectIsEmailVerified', () => {
  test('should return false when no user is authenticated', () => {
    const state = stateBuilder().withoutAuthUser({}).build()

    const isVerified = selectIsEmailVerified(state)

    expect(isVerified).toBe(false)
  })

  test('should return false when user email is not verified', () => {
    const state = stateBuilder()
      .withAuthUser({
        id: 'user-123',
        email: 'test@example.com',
        isEmailVerified: false,
      })
      .build()

    const isVerified = selectIsEmailVerified(state)

    expect(isVerified).toBe(false)
  })

  test('should return true when user email is verified', () => {
    const state = stateBuilder()
      .withAuthUser({
        id: 'user-123',
        email: 'test@example.com',
        isEmailVerified: true,
      })
      .build()

    const isVerified = selectIsEmailVerified(state)

    expect(isVerified).toBe(true)
  })
})

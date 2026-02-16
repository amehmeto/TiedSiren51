import { describe, expect, test } from 'vitest'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { AuthProvider } from '@/core/auth/auth-user'
import { selectAuthProvider } from './selectAuthProvider'

describe('selectAuthProvider', () => {
  test('should return the auth provider when user is authenticated', () => {
    const state = stateBuilder()
      .withAuthUser({
        id: 'user-123',
        email: 'test@example.com',
        authProvider: AuthProvider.Google,
      })
      .build()

    const authProvider = selectAuthProvider(state)

    expect(authProvider).toBe(AuthProvider.Google)
  })

  test('should return email provider for email-authenticated user', () => {
    const state = stateBuilder()
      .withAuthUser({
        id: 'user-456',
        email: 'email@example.com',
        authProvider: AuthProvider.Email,
      })
      .build()

    const authProvider = selectAuthProvider(state)

    expect(authProvider).toBe(AuthProvider.Email)
  })

  test('should return undefined when user is not authenticated', () => {
    const state = stateBuilder().withoutAuthUser({}).build()

    const authProvider = selectAuthProvider(state)

    expect(authProvider).toBeUndefined()
  })
})

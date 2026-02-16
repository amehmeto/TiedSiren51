import { describe, expect, test } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { selectEmailVerificationStatus } from './selectEmailVerificationStatus'

describe('selectEmailVerificationStatus', () => {
  test('should return default verification status', () => {
    const store = createTestStore({}, stateBuilder().build())

    const expectedStatus = {
      isEmailVerified: false,
      isVerificationEmailSent: false,
      isRefreshingEmailVerification: false,
    }

    const status = selectEmailVerificationStatus(store.getState())

    expect(status).toStrictEqual(expectedStatus)
  })

  test('should return verified status when user email is verified', () => {
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

    const status = selectEmailVerificationStatus(store.getState())

    expect(status.isEmailVerified).toBe(true)
  })

  test('should return verification email sent status', () => {
    const store = createTestStore(
      {},
      stateBuilder().withVerificationEmailSent(true).build(),
    )

    const status = selectEmailVerificationStatus(store.getState())

    expect(status.isVerificationEmailSent).toBe(true)
  })

  test('should return refreshing status', () => {
    const store = createTestStore(
      {},
      stateBuilder().withRefreshingEmailVerification(true).build(),
    )

    const status = selectEmailVerificationStatus(store.getState())

    expect(status.isRefreshingEmailVerification).toBe(true)
  })
})

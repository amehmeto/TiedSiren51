import { describe, expect, test } from 'vitest'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { selectEmailVerificationStatus } from './selectEmailVerificationStatus'

describe('selectEmailVerificationStatus', () => {
  test('should return default verification status', () => {
    const state = stateBuilder().build()

    const expectedStatus = {
      isEmailVerified: false,
      isSendingVerificationEmail: false,
      isVerificationEmailSent: false,
      isRefreshingEmailVerification: false,
    }

    const status = selectEmailVerificationStatus(state)

    expect(status).toStrictEqual(expectedStatus)
  })

  test('should return verified status when user email is verified', () => {
    const state = stateBuilder()
      .withAuthUser({
        id: 'user-123',
        email: 'test@example.com',
        isEmailVerified: true,
      })
      .build()

    const status = selectEmailVerificationStatus(state)

    expect(status.isEmailVerified).toBe(true)
  })

  test('should return verification email sent status', () => {
    const state = stateBuilder().withVerificationEmailSent(true).build()

    const status = selectEmailVerificationStatus(state)

    expect(status.isVerificationEmailSent).toBe(true)
  })

  test('should return refreshing status', () => {
    const state = stateBuilder().withRefreshingEmailVerification(true).build()

    const status = selectEmailVerificationStatus(state)

    expect(status.isRefreshingEmailVerification).toBe(true)
  })
})

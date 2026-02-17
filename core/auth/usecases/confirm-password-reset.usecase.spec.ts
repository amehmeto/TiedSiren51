import { beforeEach, describe, it } from 'vitest'
import { authentificationFixture } from '@/core/auth/authentification.fixture'

describe('Feature: Confirm Password Reset', () => {
  let fixture: ReturnType<typeof authentificationFixture>

  beforeEach(() => {
    fixture = authentificationFixture()
  })

  it('should confirm password reset successfully', async () => {
    await fixture.when.confirmPasswordReset(
      'valid-reset-code',
      'newPassword123',
    )

    fixture.then.passwordResetShouldBeConfirmed()
    fixture.then.confirmPasswordResetShouldNotBeLoading()
  })

  it('should fail when reset code is expired', async () => {
    fixture.given.confirmPasswordResetWillFailWith(
      'This password reset link has expired. Please request a new one.',
    )

    await fixture.when.confirmPasswordReset(
      'expired-reset-code',
      'newPassword123',
    )

    fixture.then.confirmPasswordResetErrorShouldBe(
      'This password reset link has expired. Please request a new one.',
    )
    fixture.then.confirmPasswordResetShouldNotBeLoading()
  })

  it('should fail when reset code is invalid', async () => {
    fixture.given.confirmPasswordResetWillFailWith(
      'This password reset link is invalid. Please request a new one.',
    )

    await fixture.when.confirmPasswordReset(
      'invalid-reset-code',
      'newPassword123',
    )

    fixture.then.confirmPasswordResetErrorShouldBe(
      'This password reset link is invalid. Please request a new one.',
    )
    fixture.then.confirmPasswordResetShouldNotBeLoading()
  })
})

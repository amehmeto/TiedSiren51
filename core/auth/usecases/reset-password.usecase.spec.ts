import { beforeEach, describe, it } from 'vitest'
import { authentificationFixture } from '@/core/auth/authentification.fixture'

describe('Feature: Reset Password', () => {
  let fixture: ReturnType<typeof authentificationFixture>

  beforeEach(() => {
    fixture = authentificationFixture()
  })

  it('should send password reset email successfully', async () => {
    fixture.given.nowIs('2024-01-15T10:00:00.000Z')

    await fixture.when.resetPasswordFor('user@example.com')

    fixture.then.passwordResetShouldBeSentTo('user@example.com')
    fixture.then.lastPasswordResetRequestAtShouldBe('2024-01-15T10:00:00.000Z')
    fixture.then.authShouldNotBeLoading()
  })

  it('should show toast when resending password reset email', async () => {
    fixture.given.nowIs('2024-01-15T10:00:00.000Z')
    await fixture.when.resetPasswordFor('user@example.com')

    fixture.given.nowIs('2024-01-15T10:01:00.000Z')
    await fixture.when.resetPasswordFor('user@example.com')

    fixture.then.toastShouldShow('Password reset email sent! Check your inbox.')
    fixture.then.lastPasswordResetRequestAtShouldBe('2024-01-15T10:01:00.000Z')
  })

  it('should fail when user is not found', async () => {
    fixture.given.authGatewayWillRejectWith('No account found with this email.')

    await fixture.when.resetPasswordFor('nonexistent@example.com')

    fixture.then.authenticationErrorsShouldBe(
      'No account found with this email.',
    )
    fixture.then.passwordResetShouldNotBeSent()
    fixture.then.authShouldNotBeLoading()
  })

  it('should fail when rate limited', async () => {
    fixture.given.authGatewayWillRejectWith(
      'Too many requests. Please try again later.',
    )

    await fixture.when.resetPasswordFor('user@example.com')

    fixture.then.authenticationErrorsShouldBe(
      'Too many requests. Please try again later.',
    )
    fixture.then.passwordResetShouldNotBeSent()
    fixture.then.authShouldNotBeLoading()
  })

  it('should fail with invalid email', async () => {
    fixture.given.authGatewayWillRejectWith('Invalid email address.')

    await fixture.when.resetPasswordFor('invalid-email')

    fixture.then.authenticationErrorsShouldBe('Invalid email address.')
    fixture.then.passwordResetShouldNotBeSent()
    fixture.then.authShouldNotBeLoading()
  })
})

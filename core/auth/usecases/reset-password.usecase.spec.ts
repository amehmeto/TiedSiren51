import { beforeEach, describe, it } from 'vitest'
import { authentificationFixture } from '@/core/auth/authentification.fixture'

describe('Feature: Reset Password', () => {
  let fixture: ReturnType<typeof authentificationFixture>

  beforeEach(() => {
    fixture = authentificationFixture()
  })

  it('should send password reset email successfully', async () => {
    await fixture.when.resetPassword('user@example.com')

    fixture.then.passwordResetShouldBeSent()
    fixture.then.shouldNotBeLoading()
  })

  it('should fail when user is not found', async () => {
    fixture.given.authGatewayWillRejectWith('No account found with this email.')

    await fixture.when.resetPassword('nonexistent@example.com')

    fixture.then.authenticationErrorsShouldBe(
      'No account found with this email.',
    )
    fixture.then.passwordResetShouldNotBeSent()
    fixture.then.shouldNotBeLoading()
  })

  it('should fail when rate limited', async () => {
    fixture.given.authGatewayWillRejectWith(
      'Too many requests. Please try again later.',
    )

    await fixture.when.resetPassword('user@example.com')

    fixture.then.authenticationErrorsShouldBe(
      'Too many requests. Please try again later.',
    )
    fixture.then.passwordResetShouldNotBeSent()
    fixture.then.shouldNotBeLoading()
  })

  it('should fail with invalid email', async () => {
    fixture.given.authGatewayWillRejectWith('Invalid email address.')

    await fixture.when.resetPassword('invalid-email')

    fixture.then.authenticationErrorsShouldBe('Invalid email address.')
    fixture.then.passwordResetShouldNotBeSent()
    fixture.then.shouldNotBeLoading()
  })
})

import { beforeEach, describe, it } from 'vitest'
import { authentificationFixture } from '@/core/auth/authentification.fixture'

describe('Feature: Reset Password', () => {
  let fixture: ReturnType<typeof authentificationFixture>

  beforeEach(() => {
    fixture = authentificationFixture()
  })

  it('should send password reset email successfully', async () => {
    await fixture.when.resetPasswordFor('user@example.com')

    fixture.then.passwordResetShouldBeSentTo('user@example.com')
    fixture.then.authShouldNotBeLoading()
  })

  it.each<[string, string, string]>([
    [
      'user is not found',
      'No account found with this email.',
      'nonexistent@example.com',
    ],
    [
      'rate limited',
      'Too many requests. Please try again later.',
      'user@example.com',
    ],
    ['invalid email', 'Invalid email address.', 'invalid-email'],
  ])('should fail when %s', async (_scenario, errorMessage, email) => {
    fixture.given.authGatewayWillRejectWith(errorMessage)

    await fixture.when.resetPasswordFor(email)

    fixture.then.authenticationErrorsShouldBe(errorMessage)
    fixture.then.passwordResetShouldNotBeSent()
    fixture.then.authShouldNotBeLoading()
  })
})

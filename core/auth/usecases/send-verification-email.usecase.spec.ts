import { beforeEach, describe, it } from 'vitest'
import { authentificationFixture } from '@/core/auth/authentification.fixture'

describe('Feature: Send Verification Email', () => {
  let fixture: ReturnType<typeof authentificationFixture>

  beforeEach(() => {
    fixture = authentificationFixture()
  })

  it('should send verification email successfully', async () => {
    await fixture.when.sendVerificationEmail()

    fixture.then.verificationEmailShouldBeSent()
    fixture.then.toastShouldShow('Verification email sent! Check your inbox.')
  })

  it('should fail when rate limited', async () => {
    fixture.given.sendVerificationEmailWillFailWith(
      'Too many requests. Please try again later.',
    )

    await fixture.when.sendVerificationEmail()

    fixture.then.authenticationErrorsShouldBe(
      'Too many requests. Please try again later.',
    )
    fixture.then.authShouldNotBeLoading()
  })
})

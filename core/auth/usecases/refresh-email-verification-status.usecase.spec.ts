import { beforeEach, describe, it } from 'vitest'
import { authentificationFixture } from '@/core/auth/authentification.fixture'

describe('Feature: Refresh Email Verification Status', () => {
  let fixture: ReturnType<typeof authentificationFixture>

  beforeEach(() => {
    fixture = authentificationFixture()
  })

  it('should update state when email is verified', async () => {
    fixture.given.authenticationWithEmailWillSucceedForUser(
      {
        id: 'user-id',
        email: 'test@example.com',
        isEmailVerified: false,
      },
      'password',
    )
    await fixture.when.signInWithEmail('test@example.com', 'password')
    fixture.given.refreshEmailVerificationWillReturn(true)

    await fixture.when.refreshEmailVerificationStatus()

    fixture.then.emailShouldBeVerified()
    fixture.then.toastShouldShow('Email verified successfully!')
  })

  it('should not update state when email is not yet verified', async () => {
    fixture.given.authenticationWithEmailWillSucceedForUser(
      {
        id: 'user-id',
        email: 'test@example.com',
        isEmailVerified: false,
      },
      'password',
    )
    await fixture.when.signInWithEmail('test@example.com', 'password')
    fixture.given.refreshEmailVerificationWillReturn(false)

    await fixture.when.refreshEmailVerificationStatus()

    fixture.then.emailShouldNotBeVerified()
  })
})

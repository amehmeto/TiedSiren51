import { beforeEach, describe, it } from 'vitest'
import { authentificationFixture } from '@/core/auth/authentification.fixture'

describe('Feature: Apply Email Verification Code', () => {
  let fixture: ReturnType<typeof authentificationFixture>

  beforeEach(() => {
    fixture = authentificationFixture()
  })

  it('should verify email and show success toast', async () => {
    fixture.given.authenticationWithEmailWillSucceedForUser(
      {
        id: 'user-id',
        email: 'test@example.com',
        isEmailVerified: false,
      },
      'password',
    )
    await fixture.when.signInWithEmail('test@example.com', 'password')

    await fixture.when.applyEmailVerificationCode('valid-oob-code')

    fixture.then.toastShouldShow('Email verified!')
  })

  it('should show already verified toast when email is already verified', async () => {
    fixture.given.authenticationWithEmailWillSucceedForUser(
      {
        id: 'user-id',
        email: 'test@example.com',
        isEmailVerified: false,
      },
      'password',
    )
    await fixture.when.signInWithEmail('test@example.com', 'password')
    fixture.given.applyEmailVerificationCodeWillReturnAlreadyVerified()

    await fixture.when.applyEmailVerificationCode('any-oob-code')

    fixture.then.toastShouldShow('Email is already verified.')
  })

  it('should propagate error when verification code is expired', async () => {
    fixture.given.authenticationWithEmailWillSucceedForUser(
      {
        id: 'user-id',
        email: 'test@example.com',
        isEmailVerified: false,
      },
      'password',
    )
    await fixture.when.signInWithEmail('test@example.com', 'password')
    fixture.given.applyEmailVerificationCodeWillFailWith(
      'Verification link has expired. Please request a new one.',
    )

    await fixture.when.applyEmailVerificationCode('expired-oob-code')

    fixture.then.emailShouldNotBeVerified()
  })

  it('should propagate error when verification code is invalid', async () => {
    fixture.given.authenticationWithEmailWillSucceedForUser(
      {
        id: 'user-id',
        email: 'test@example.com',
        isEmailVerified: false,
      },
      'password',
    )
    await fixture.when.signInWithEmail('test@example.com', 'password')
    fixture.given.applyEmailVerificationCodeWillFailWith(
      'Invalid verification link.',
    )

    await fixture.when.applyEmailVerificationCode('invalid-oob-code')

    fixture.then.emailShouldNotBeVerified()
  })

  it('should propagate error when network fails', async () => {
    fixture.given.authenticationWithEmailWillSucceedForUser(
      {
        id: 'user-id',
        email: 'test@example.com',
        isEmailVerified: false,
      },
      'password',
    )
    await fixture.when.signInWithEmail('test@example.com', 'password')
    fixture.given.applyEmailVerificationCodeWillFailWith(
      'Could not verify email. Please check your connection.',
    )

    await fixture.when.applyEmailVerificationCode('valid-oob-code')

    fixture.then.emailShouldNotBeVerified()
  })

  it('should update email verified state on success', async () => {
    fixture.given.authenticationWithEmailWillSucceedForUser(
      {
        id: 'user-id',
        email: 'test@example.com',
        isEmailVerified: false,
      },
      'password',
    )
    await fixture.when.signInWithEmail('test@example.com', 'password')

    await fixture.when.applyEmailVerificationCode('valid-oob-code')

    fixture.then.emailShouldBeVerified()
  })
})

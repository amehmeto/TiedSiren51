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

  it.each<[string, string, string]>([
    [
      'verification code is expired',
      'Verification link has expired. Please request a new one.',
      'expired-oob-code',
    ],
    [
      'verification code is invalid',
      'Invalid verification link.',
      'invalid-oob-code',
    ],
    [
      'network fails',
      'Could not verify email. Please check your connection.',
      'valid-oob-code',
    ],
  ])(
    'should propagate error when %s',
    async (_scenario, errorMessage, oobCode) => {
      fixture.given.authenticationWithEmailWillSucceedForUser(
        {
          id: 'user-id',
          email: 'test@example.com',
          isEmailVerified: false,
        },
        'password',
      )
      await fixture.when.signInWithEmail('test@example.com', 'password')
      fixture.given.applyEmailVerificationCodeWillFailWith(errorMessage)

      await fixture.when.applyEmailVerificationCode(oobCode)

      fixture.then.emailShouldNotBeVerified()
    },
  )

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

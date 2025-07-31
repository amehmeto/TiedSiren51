import { beforeEach, describe, it } from 'vitest'
import { authentificationFixture } from '@/core/auth/authentification.fixture'

describe('Feature: Authenticate with Email', () => {
  let fixture: ReturnType<typeof authentificationFixture>

  beforeEach(() => {
    fixture = authentificationFixture()
  })

  it('should authenticate with Email successfully', async () => {
    fixture.given.authenticationWithEmailWillSucceedForUser(
      {
        id: 'auth-user-id',
        email: 'amehmeto@gmail.com',
        username: 'Arthur',
      },
      'validPass123',
    )

    await fixture.when.signUpWithEmail('amehmeto@gmail.com', 'validPass123')

    fixture.then.userShouldBeAuthenticated({
      id: 'auth-user-id',
      email: 'amehmeto@gmail.com',
      username: 'Arthur',
    })
    fixture.then.shouldNotBeLoading()
  })
  it('should show error when email is already in use', async () => {
    fixture.given.authGatewayWillRejectWith('This email is already in use.')

    await fixture.when.signUpWithEmail('existing@example.com', 'validPass123')

    fixture.then.authenticationErrorsShouldBe('This email is already in use.')
    fixture.then.shouldNotBeLoading()
  })
  it('should show error when password is too weak', async () => {
    fixture.given.authGatewayWillRejectWith(
      'Password must be at least 6 characters.',
    )

    await fixture.when.signUpWithEmail('user@example.com', 'weak')

    fixture.then.authenticationErrorsShouldBe(
      'Password must be at least 6 characters.',
    )
  })
})

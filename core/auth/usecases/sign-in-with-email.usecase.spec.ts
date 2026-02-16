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
        isEmailVerified: true,
        username: 'Arthur',
      },
      'validPass123',
    )

    await fixture.when.signInWithEmail('amehmeto@gmail.com', 'validPass123')

    fixture.then.userShouldBeAuthenticated({
      id: 'auth-user-id',
      email: 'amehmeto@gmail.com',
      isEmailVerified: true,
      username: 'Arthur',
    })
    fixture.then.authShouldNotBeLoading()
  })

  it('does not authenticate user when credentials are invalid', async () => {
    fixture.given.authGatewayWillRejectWith('Invalid credentials')

    await fixture.when.signInWithEmail('amehmeto@gmail.com', 'wrongPassword!')

    fixture.then.authenticationErrorsShouldBe('Invalid credentials')
    fixture.then.authShouldNotBeLoading()
  })

  it('should fail with invalid email', async () => {
    fixture.given.authGatewayWillRejectWith('Invalid email address')
    await fixture.when.signInWithEmail('amehmetomail.com', 'wrongPassword!')

    fixture.then.authenticationErrorsShouldBe('Invalid email address')
    fixture.then.authShouldNotBeLoading()
  })

  it('should fail with invalid password', async () => {
    fixture.given.authGatewayWillRejectWith('Password is wrong')
    await fixture.when.signInWithEmail('amehmeto@gmail.com', 'wrongPassword!')

    fixture.then.authenticationErrorsShouldBe('Password is wrong')
    fixture.then.authShouldNotBeLoading()
  })
})

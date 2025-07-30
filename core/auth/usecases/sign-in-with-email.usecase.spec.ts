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

    await fixture.when.signInWithEmail('amehmeto@gmail.com', 'validPass123')

    fixture.then.userShouldBeAuthenticated({
      id: 'auth-user-id',
      email: 'amehmeto@gmail.com',
      username: 'Arthur',
    })
    fixture.then.shouldBeLoading(false)
  })

  it('does not authenticate user when credentials are invalid', async () => {
    fixture.given.authGatewayWillRejectWith('Invalid credentials')

    await fixture.when.signInWithEmail('amehmeto@gmail.com', 'wrongPassword!')

    fixture.then.errorShouldBe('Invalid credentials')
    fixture.then.shouldBeLoading(false)
  })

  it('should fail with invalid email', async () => {
    fixture.given.authGatewayWillRejectWith('Invalid email address')
    await fixture.when.signInWithEmail('amehmetomail.com', 'wrongPassword!')

    fixture.then.errorShouldBe('Invalid email address')
    fixture.then.shouldBeLoading(false)
  })

  it('should fail with invalid password', async () => {
    fixture.given.authGatewayWillRejectWith('Password is wrong')
    await fixture.when.signInWithEmail('amehmeto@gmail.com', 'wrongPassword!')

    fixture.then.errorShouldBe('Password is wrong')
    fixture.then.shouldBeLoading(false)
  })
})

import { beforeEach, describe, it } from 'vitest'
import { authentificationFixture } from '@/core/auth/authentification.fixture'

describe('Feature: Authenticate with Apple', () => {
  let fixture: ReturnType<typeof authentificationFixture>

  beforeEach(() => {
    fixture = authentificationFixture()
  })

  it('should authenticate with Apple successfully', async () => {
    fixture.given.authenticationWithAppleWillSucceedForUser({
      id: 'auth-user-id',
      email: 'steeve@gmail.com',
      isEmailVerified: true,
      username: 'Steeve',
    })

    await fixture.when.signInWithApple()

    fixture.then.userShouldBeAuthenticated({
      id: 'auth-user-id',
      email: 'steeve@gmail.com',
      isEmailVerified: true,
      username: 'Steeve',
    })
  })
})

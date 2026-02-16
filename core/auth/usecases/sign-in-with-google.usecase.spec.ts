import { beforeEach, describe, it } from 'vitest'
import { authentificationFixture } from '@/core/auth/authentification.fixture'

describe('Feature: Authenticate with Google', () => {
  let fixture: ReturnType<typeof authentificationFixture>

  beforeEach(() => {
    fixture = authentificationFixture()
  })

  it('should authenticate with Google successfully', async () => {
    fixture.given.authenticationWithGoogleWillSucceedForUser({
      id: 'auth-user-id',
      email: 'elon@gmail.com',
      isEmailVerified: true,
      username: 'Elon',
    })

    await fixture.when.signInWithGoogle()

    fixture.then.userShouldBeAuthenticated({
      id: 'auth-user-id',
      email: 'elon@gmail.com',
      isEmailVerified: true,
      username: 'Elon',
    })
  })
})

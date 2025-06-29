import { beforeEach, describe, it } from 'vitest'
import { authentificationFixture } from '@/core/auth/authentification.fixture'

describe('Feature: Authenticate with Email', () => {
  let fixture: ReturnType<typeof authentificationFixture>

  beforeEach(() => {
    fixture = authentificationFixture()
  })

  it('should authenticate with Email successfully', async () => {
    fixture.given.authenticationWithEmailWillSucceedForUser({
      id: 'auth-user-id',
      email: 'amehmeto@gmail.com',
      username: 'Arthur',
    })

    await fixture.when.signInWithEmail('amehmeto@gmail.com', 'qwerty1234')

    fixture.then.userShouldBeAuthenticated({
      id: 'auth-user-id',
      email: 'amehmeto@gmail.com',
      username: 'Arthur',
    })
  })
})

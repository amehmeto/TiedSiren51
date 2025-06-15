import { beforeEach, describe, it } from 'vitest'
import { authentificationFixture } from '@/core/auth/authentification.fixture'

describe('Feature: Sign in with Email', () => {
  let fixture: ReturnType<typeof authentificationFixture>

  beforeEach(() => {
    fixture = authentificationFixture()
  })

  it('should sign in with Email successfully', async () => {
    fixture.given.signInWithEmailWillSucceedForUser({
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

  it('should reject sign in with invalid email', async () => {
    await fixture.when.signInWithEmail('invalid-email', 'qwerty1234')

    fixture.then.userShouldNotBeAuthenticatedWithInvalidEmail(
      'Please correct your email address',
    )
  })
})

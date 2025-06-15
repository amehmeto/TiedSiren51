import { beforeEach, describe, it } from 'vitest'
import { authentificationFixture } from '@/core/auth/authentification.fixture'

describe('Feature: Sign up with Email', () => {
  let fixture: ReturnType<typeof authentificationFixture>

  beforeEach(() => {
    fixture = authentificationFixture()
  })

  it('should sign up with Email successfully', async () => {
    fixture.given.signUpWithEmailWillSucceedForUser({
      id: 'auth-user-id',
      email: 'amehmeto@gmail.com',
      username: 'Arthur',
    })

    await fixture.when.signUpWithEmail('amehmeto@gmail.com', 'qwerty1234')

    fixture.then.userShouldBeAuthenticated({
      id: 'auth-user-id',
      email: 'amehmeto@gmail.com',
      username: 'Arthur',
    })
  })

  it('should reject sign up with invalid email', async () => {
    await fixture.when.signUpWithEmail('invalid-email', 'qwerty1234')

    fixture.then.userShouldNotBeAuthenticatedWithInvalidEmail(
      'Please correct your email address',
    )
  })
})

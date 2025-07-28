import { beforeEach, describe, it, expect } from 'vitest'
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
      'qwerty1234',
    )

    await fixture.when.signUpWithEmail('amehmeto@gmail.com', 'qwerty1234')

    fixture.then.userShouldBeAuthenticated({
      id: 'auth-user-id',
      email: 'amehmeto@gmail.com',
      username: 'Arthur',
    })
  })

  it('does not authenticate user when credentials are invalid', async () => {
    fixture.given.authenticationWithEmailWillFailForUser(
      {
        id: 'auth-user-id',
        email: 'amehmeto@gmail.com',
        username: 'Arthur',
      },
      'wrongPassword!',
    )

    await fixture.when.signUpWithEmail('amehmeto@gmail.com', 'wrongPassword!')

    fixture.then.userShouldNotBeAuthenticated()
  })

  it('should fail with invalid email', async () => {
    const result = await fixture.when.signUpWithEmail(
      'bademail',
      'validPass123',
    )
    expect(result.payload).toMatch('Invalid email address.')
  })

  it('should fail with short password', async () => {
    const result = await fixture.when.signUpWithEmail(
      'user@example.com',
      'short',
    )
    expect(result.payload).toMatch('Password must be at least 8 characters.')
  })
})

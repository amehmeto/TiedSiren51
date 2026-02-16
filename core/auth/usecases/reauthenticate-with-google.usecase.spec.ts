import { beforeEach, describe, it } from 'vitest'
import { authentificationFixture } from '@/core/auth/authentification.fixture'

describe('Feature: Re-authenticate with Google for sensitive operations', () => {
  let fixture: ReturnType<typeof authentificationFixture>

  beforeEach(() => {
    fixture = authentificationFixture()
  })

  it('should record timestamp on successful Google re-authentication', async () => {
    fixture.given.nowIs('2024-01-15T10:00:00.000Z')
    fixture.given.googleReauthenticationWillSucceed()

    await fixture.when.reauthenticateWithGoogle()

    fixture.then.lastReauthenticatedAtShouldBe('2024-01-15T10:00:00.000Z')
    fixture.then.reauthErrorShouldBeNull()
    fixture.then.reauthShouldNotBeLoading()
  })

  it('should set error on failed Google re-authentication', async () => {
    fixture.given.googleReauthenticationWillFailWith(
      'Google sign-in was cancelled.',
    )

    await fixture.when.reauthenticateWithGoogle()

    fixture.then.reauthErrorShouldBe('Google sign-in was cancelled.')
    fixture.then.lastReauthenticatedAtShouldBe(null)
    fixture.then.reauthShouldNotBeLoading()
  })
})

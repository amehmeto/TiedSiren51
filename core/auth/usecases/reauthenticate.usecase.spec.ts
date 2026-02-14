import { beforeEach, describe, it } from 'vitest'
import { authentificationFixture } from '@/core/auth/authentification.fixture'

describe('Feature: Re-authenticate for sensitive operations', () => {
  let fixture: ReturnType<typeof authentificationFixture>

  beforeEach(() => {
    fixture = authentificationFixture()
  })

  it('should record timestamp on successful re-authentication', async () => {
    fixture.given.nowIs('2024-01-15T10:00:00.000Z')
    fixture.given.reauthenticationWillSucceed()

    await fixture.when.reauthenticate('validPassword123')

    fixture.then.lastReauthenticatedAtShouldBe('2024-01-15T10:00:00.000Z')
    fixture.then.reauthErrorShouldBeNull()
    fixture.then.reauthShouldNotBeLoading()
  })

  it('should set error on failed re-authentication', async () => {
    fixture.given.reauthenticationWillFailWith('Incorrect password.')

    await fixture.when.reauthenticate('wrongPassword')

    fixture.then.reauthErrorShouldBe('Incorrect password.')
    fixture.then.lastReauthenticatedAtShouldBe(null)
    fixture.then.reauthShouldNotBeLoading()
  })
})

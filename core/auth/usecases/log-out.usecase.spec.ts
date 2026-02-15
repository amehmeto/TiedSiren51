import { beforeEach, describe, it } from 'vitest'
import { AuthErrorType } from '@/core/auth/auth-error-type'
import { authentificationFixture } from '@/core/auth/authentification.fixture'

describe('Feature: Log out', () => {
  let fixture: ReturnType<typeof authentificationFixture>

  beforeEach(() => {
    fixture = authentificationFixture()
  })

  it('should log out successfully', async () => {
    fixture.given.authUserIs({
      id: 'fake-joe-id',
      email: 'joe@gmail.com',
      username: 'Joe',
    })

    await fixture.when.logOut()

    fixture.then.userShouldNotBeAuthenticated()
  })

  it('should surface error when log out fails', async () => {
    fixture.given.authUserIs({
      id: 'fake-joe-id',
      email: 'joe@gmail.com',
      username: 'Joe',
    })
    fixture.given.logOutWillRejectWith(
      'No internet connection. Please check your network and try again.',
      AuthErrorType.Network,
    )

    await fixture.when.logOut()

    fixture.then.authenticationErrorsShouldBe(
      'No internet connection. Please check your network and try again.',
    )
    fixture.then.authErrorTypeShouldBe(AuthErrorType.Network)
    fixture.then.authShouldNotBeLoading()
  })
})

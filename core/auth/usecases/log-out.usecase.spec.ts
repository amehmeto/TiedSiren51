import { beforeEach, describe, it } from 'vitest'
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
      isEmailVerified: true,
      username: 'Joe',
    })

    await fixture.when.logOut()

    fixture.then.userShouldNotBeAuthenticated()
  })
})

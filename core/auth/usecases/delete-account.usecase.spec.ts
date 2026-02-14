import { beforeEach, describe, it } from 'vitest'
import { authentificationFixture } from '@/core/auth/authentification.fixture'

describe('Feature: Delete account', () => {
  let fixture: ReturnType<typeof authentificationFixture>

  beforeEach(() => {
    fixture = authentificationFixture()
  })

  it('should delete account and reset user state', async () => {
    fixture.given.authUserIs({
      id: 'fake-joe-id',
      email: 'joe@gmail.com',
      username: 'Joe',
    })
    fixture.given.accountDeletionWillSucceed()

    await fixture.when.deleteAccount()

    fixture.then.userShouldNotBeAuthenticated()
    fixture.then.accountDeletionShouldNotBeLoading()
  })

  it('should set error on failed account deletion', async () => {
    fixture.given.authUserIs({
      id: 'fake-joe-id',
      email: 'joe@gmail.com',
      username: 'Joe',
    })
    fixture.given.accountDeletionWillFailWith(
      'Please re-authenticate to perform this action.',
    )

    await fixture.when.deleteAccount()

    fixture.then.deleteAccountErrorShouldBe(
      'Please re-authenticate to perform this action.',
    )
    fixture.then.accountDeletionShouldNotBeLoading()
  })
})

import { beforeEach, describe, it } from 'vitest'
import { authentificationFixture } from '@/core/auth/authentification.fixture'

describe('Feature: Change password', () => {
  let fixture: ReturnType<typeof authentificationFixture>

  beforeEach(() => {
    fixture = authentificationFixture()
  })

  it('should succeed when changing password', async () => {
    fixture.given.changePasswordWillSucceed()

    await fixture.when.changePassword('newSecurePassword123')

    fixture.then.changePasswordShouldHaveSucceeded()
    fixture.then.changePasswordErrorShouldBeNull()
    fixture.then.changePasswordShouldNotBeLoading()
  })

  it('should set error on failed password change', async () => {
    fixture.given.changePasswordWillFailWith('Password is too weak.')

    await fixture.when.changePassword('weak')

    fixture.then.changePasswordErrorShouldBe('Password is too weak.')
    fixture.then.changePasswordShouldNotHaveSucceeded()
    fixture.then.changePasswordShouldNotBeLoading()
  })
})

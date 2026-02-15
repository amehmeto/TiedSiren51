import { beforeEach, describe, expect, it } from 'vitest'
import { AppStore } from '@/core/_redux_/createStore'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { authentificationFixture } from '@/core/auth/authentification.fixture'
import { FakeAuthGateway } from '@/infra/auth-gateway/fake.auth.gateway'
import { FakeDataBlockSessionRepository } from '@/infra/block-session-repository/fake-data.block-session.repository'
import { FakeDataBlocklistRepository } from '@/infra/blocklist-repository/fake-data.blocklist.repository'
import { FakeDataSirensRepository } from '@/infra/siren-repository/fake-data.sirens-repository'
import { deleteAccount } from './delete-account.usecase'

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

  describe('Cascade ordering', () => {
    let callOrder: string[]
    let store: AppStore

    beforeEach(() => {
      callOrder = []
      const authGateway = new FakeAuthGateway()
      const blockSessionRepository = new FakeDataBlockSessionRepository()
      const blocklistRepository = new FakeDataBlocklistRepository()
      const sirensRepository = new FakeDataSirensRepository()

      blockSessionRepository.deleteAll = async () => {
        callOrder.push('blockSessions')
      }

      blocklistRepository.deleteAll = async () => {
        callOrder.push('blocklists')
      }

      sirensRepository.deleteAllSirens = async () => {
        callOrder.push('sirens')
      }

      authGateway.deleteAccount = async () => {
        callOrder.push('authAccount')
      }

      const preloadedState = stateBuilder()
        .withAuthUser({ id: 'user-id', email: 'user@test.com' })
        .build()
      store = createTestStore(
        {
          authGateway,
          blockSessionRepository,
          blocklistRepository,
          sirensRepository,
        },
        preloadedState,
      )
    })

    it('should delete user data before deleting auth account', async () => {
      await store.dispatch(deleteAccount())

      expect(callOrder).toStrictEqual([
        'blockSessions',
        'blocklists',
        'sirens',
        'authAccount',
      ])
    })
  })
})

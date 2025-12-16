import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { FakeAuthGateway } from '@/infra/auth-gateway/fake.auth.gateway'
import { InMemoryLogger } from '@/infra/logger/in-memory.logger'

describe('Feature: Listen to user logged out events', () => {
  let authGateway: FakeAuthGateway
  let logger: InMemoryLogger

  beforeEach(() => {
    authGateway = new FakeAuthGateway()
    logger = new InMemoryLogger()
  })

  it('should dispatch userAuthenticated and logOut when user logs out', () => {
    const store = createTestStore({ authGateway })

    authGateway.simulateUserLoggedOut()
    const dispatchedActions = store.getActions()

    const hasLogOutPending = dispatchedActions.some(
      (action) => action.type === 'auth/logOut/pending',
    )

    expect(hasLogOutPending).toBe(true)
  })

  it('should log error when dispatch throws', () => {
    const store = createTestStore({ authGateway, logger })
    const expectedLog = {
      level: 'error',
      message: 'Error in onUserLoggedOut listener: Error: Dispatch failed',
    }
    // eslint-disable-next-line no-restricted-properties -- store.dispatch can't be injected
    vi.spyOn(store, 'dispatch').mockImplementation(() => {
      throw new Error('Dispatch failed')
    })

    authGateway.simulateUserLoggedOut()

    const logs = logger.getLogs()
    expect(logs).toContainEqual(expectedLog)
  })
})

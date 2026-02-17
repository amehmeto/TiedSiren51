import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { userAuthenticated } from '@/core/auth/reducer'
import { FakeAuthGateway } from '@/infra/auth-gateway/fake.auth.gateway'
import { InMemoryLogger } from '@/infra/logger/in-memory.logger'

describe('onUserLoggedIn listener', () => {
  let authGateway: FakeAuthGateway
  let logger: InMemoryLogger

  beforeEach(() => {
    authGateway = new FakeAuthGateway()
    logger = new InMemoryLogger()
  })

  it('should dispatch a user status changed action when the auth gateway notifies the user is authenticated', async () => {
    const store = createTestStore({
      authGateway,
    })

    const userPayload = {
      id: 'wesh alors',
      email: 'jul@gmail.com',
      isEmailVerified: true,
      username: 'Jul',
    }
    const expectedAction = userAuthenticated(userPayload)

    authGateway.simulateUserLoggedIn(userPayload)
    const dispatchedActions = store.getActions()

    expect(dispatchedActions).toContainEqual(expectedAction)

    const hasLoadUserPending = dispatchedActions.some(
      (action) => action.type === 'auth/loadUser/pending',
    )

    expect(hasLoadUserPending).toBe(true)
  })

  it('should log error when dispatch throws', () => {
    const store = createTestStore({ authGateway, logger })
    const expectedLog = {
      level: 'error',
      message: 'Error in onUserLoggedIn listener: Error: Dispatch failed',
    }
    // eslint-disable-next-line no-restricted-properties -- store.dispatch can't be injected
    vi.spyOn(store, 'dispatch').mockImplementation(() => {
      throw new Error('Dispatch failed')
    })

    authGateway.simulateUserLoggedIn({
      id: 'user-id',
      email: 'test@test.com',
      isEmailVerified: true,
      username: 'Test',
    })

    const logs = logger.getLogs()
    expect(logs).toContainEqual(expectedLog)
  })
})

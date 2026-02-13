import { beforeEach, describe, expect, it } from 'vitest'
import { AppStore } from '@/core/_redux_/createStore'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { AuthError } from '@/core/auth/auth-error'
import { AuthErrorType } from '@/core/auth/auth-error-type'
import { onCredentialErrorListener } from '@/core/auth/listeners/on-credential-error.listener'
import { signInWithEmail } from '@/core/auth/usecases/sign-in-with-email.usecase'
import { FakeAuthGateway } from '@/infra/auth-gateway/fake.auth.gateway'
import { InMemoryLogger } from '@/infra/logger/in-memory.logger'

describe('onCredentialError listener', () => {
  let authGateway: FakeAuthGateway
  let logger: InMemoryLogger

  beforeEach(() => {
    authGateway = new FakeAuthGateway()
    logger = new InMemoryLogger()
  })

  it('should request password clear when a credential error occurs', async () => {
    authGateway.willResultWith = Promise.reject(
      new AuthError('Invalid credentials', AuthErrorType.Credential),
    )
    const store = createTestStore({ authGateway, logger })

    await store.dispatch(
      signInWithEmail({ email: 'test@test.com', password: 'wrong' }),
    )

    const { isPasswordClearRequested } = store.getState().auth
    expect(isPasswordClearRequested).toBe(true)
  })

  it('should not request password clear for non-credential errors', async () => {
    authGateway.willResultWith = Promise.reject(
      new AuthError('Network error', AuthErrorType.Network),
    )
    const store = createTestStore({ authGateway, logger })

    await store.dispatch(
      signInWithEmail({ email: 'test@test.com', password: 'pass' }),
    )

    const { isPasswordClearRequested } = store.getState().auth
    expect(isPasswordClearRequested).toBe(false)
  })

  it('should log error when dispatch throws', () => {
    let subscriber = (): void => {}
    const stateRef: { auth: { errorType: AuthErrorType | null } } = {
      auth: { errorType: null },
    }

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- mock store for isolated error handling test
    const mockStore = {
      getState: () => stateRef,
      subscribe: (fn: () => void) => {
        subscriber = fn
        return () => {}
      },
      dispatch: () => {
        throw new Error('Dispatch failed')
      },
    } as unknown as AppStore

    onCredentialErrorListener({ store: mockStore, logger })

    stateRef.auth.errorType = AuthErrorType.Credential
    subscriber()

    const expectedLog = {
      level: 'error',
      message: 'Error in onCredentialError listener: Error: Dispatch failed',
    }
    const logs = logger.getLogs()
    expect(logs).toContainEqual(expectedLog)
  })
})

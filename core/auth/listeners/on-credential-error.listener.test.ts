import { beforeEach, describe, expect, it } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { AuthError } from '@/core/auth/auth-error'
import { AuthErrorType } from '@/core/auth/auth-error-type'
import { signInWithEmail } from '@/core/auth/usecases/sign-in-with-email.usecase'
import { FakeAuthGateway } from '@/infra/auth-gateway/fake.auth.gateway'

describe('onCredentialError listener', () => {
  let authGateway: FakeAuthGateway

  beforeEach(() => {
    authGateway = new FakeAuthGateway()
  })

  it('should request password clear when a credential error occurs', async () => {
    authGateway.willResultWith = Promise.reject(
      new AuthError('Invalid credentials', AuthErrorType.Credential),
    )
    const store = createTestStore({ authGateway })

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
    const store = createTestStore({ authGateway })

    await store.dispatch(
      signInWithEmail({ email: 'test@test.com', password: 'pass' }),
    )

    const { isPasswordClearRequested } = store.getState().auth
    expect(isPasswordClearRequested).toBe(false)
  })
})

import { beforeEach, describe, expect, it } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { AuthProvider } from '@/core/auth/auth-user'
import { loadFeatureFlags } from '@/core/feature-flag/usecases/load-feature-flags.usecase'
import { FeatureFlagKey } from '@/feature-flags'
import { InMemoryFeatureFlagProvider } from '@/infra/feature-flag-provider/in-memory.feature-flag.provider'

const authenticatedState = stateBuilder()
  .withAuthUser({
    id: 'test-user-id',
    email: 'test@test.com',
    isEmailVerified: true,
    authProvider: AuthProvider.Email,
  })
  .build()

describe('onMultiDeviceReady listener', () => {
  let featureFlagProvider: InMemoryFeatureFlagProvider

  beforeEach(() => {
    featureFlagProvider = new InMemoryFeatureFlagProvider()
  })

  it('should dispatch loadDevices when MULTI_DEVICE becomes enabled for authenticated user', async () => {
    featureFlagProvider.setFlag(FeatureFlagKey.MULTI_DEVICE, true)

    const store = createTestStore({ featureFlagProvider }, authenticatedState)

    await store.dispatch(loadFeatureFlags())

    const dispatchedActions = store.getActions()
    const hasLoadDevicesPending = dispatchedActions.some(
      (action) => action.type === 'device/loadDevices/pending',
    )

    expect(hasLoadDevicesPending).toBe(true)
  })

  it('should not dispatch loadDevices when MULTI_DEVICE stays disabled', async () => {
    const store = createTestStore({ featureFlagProvider }, authenticatedState)

    await store.dispatch(loadFeatureFlags())

    const dispatchedActions = store.getActions()
    const hasLoadDevicesPending = dispatchedActions.some(
      (action) => action.type === 'device/loadDevices/pending',
    )

    expect(hasLoadDevicesPending).toBe(false)
  })
})

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { TEST_AUTH_USER } from '@/core/_tests_/test-constants'
import { loadFeatureFlags } from '@/core/feature-flag/usecases/load-feature-flags.usecase'
import { FeatureFlagKey } from '@/feature-flags'
import { InMemoryFeatureFlagProvider } from '@/infra/feature-flag-provider/in-memory.feature-flag.provider'
import { InMemoryLogger } from '@/infra/logger/in-memory.logger'

const authenticatedState = stateBuilder().withAuthUser(TEST_AUTH_USER).build()

describe('onMultiDeviceReady listener', () => {
  let featureFlagProvider: InMemoryFeatureFlagProvider
  let logger: InMemoryLogger

  beforeEach(() => {
    featureFlagProvider = new InMemoryFeatureFlagProvider()
    logger = new InMemoryLogger()
  })

  it('should dispatch loadDevices when MULTI_DEVICE becomes enabled for authenticated user', async () => {
    featureFlagProvider.setFlag(FeatureFlagKey.MULTI_DEVICE, true)

    const store = createTestStore(
      { featureFlagProvider, logger },
      authenticatedState,
    )

    await store.dispatch(loadFeatureFlags())

    const dispatchedActions = store.getActions()
    const hasLoadDevicesPending = dispatchedActions.some(
      (action) => action.type === 'device/loadDevices/pending',
    )

    expect(hasLoadDevicesPending).toBe(true)
  })

  it('should not dispatch loadDevices when MULTI_DEVICE stays disabled', async () => {
    const store = createTestStore(
      { featureFlagProvider, logger },
      authenticatedState,
    )

    await store.dispatch(loadFeatureFlags())

    const dispatchedActions = store.getActions()
    const hasLoadDevicesPending = dispatchedActions.some(
      (action) => action.type === 'device/loadDevices/pending',
    )

    expect(hasLoadDevicesPending).toBe(false)
  })

  it('should not dispatch loadDevices when MULTI_DEVICE is enabled but user is not authenticated', async () => {
    featureFlagProvider.setFlag(FeatureFlagKey.MULTI_DEVICE, true)

    const store = createTestStore({ featureFlagProvider, logger })

    await store.dispatch(loadFeatureFlags())

    const dispatchedActions = store.getActions()
    const hasLoadDevicesPending = dispatchedActions.some(
      (action) => action.type === 'device/loadDevices/pending',
    )

    expect(hasLoadDevicesPending).toBe(false)
  })

  it('should log error when dispatch throws', async () => {
    featureFlagProvider.setFlag(FeatureFlagKey.MULTI_DEVICE, true)

    const store = createTestStore(
      { featureFlagProvider, logger },
      authenticatedState,
    )

    const realDispatch = store.dispatch

    // eslint-disable-next-line local-rules/core-test-no-restricted-properties -- store.dispatch can't be injected
    vi.spyOn(store, 'dispatch').mockImplementation(() => {
      throw new Error('Dispatch failed')
    })

    await realDispatch(loadFeatureFlags())

    const logs = logger.getLogs()

    const objectContaining = expect.objectContaining({
      level: 'error',
      message: expect.stringContaining('[onMultiDeviceReadyListener]'),
    })
    expect(logs).toContainEqual(objectContaining)
  })
})

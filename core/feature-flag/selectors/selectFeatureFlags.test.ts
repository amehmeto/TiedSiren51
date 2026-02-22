import { beforeEach, describe, expect, test } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { FeatureFlagKey } from '@/feature-flags'
import { InMemoryFeatureFlagProvider } from '@/infra/feature-flag-provider/in-memory.feature-flag.provider'
import { loadFeatureFlags } from '../usecases/load-feature-flags.usecase'
import { selectFeatureFlags } from './selectFeatureFlags'

describe('selectFeatureFlags', () => {
  const {
    WEBSITE_BLOCKING,
    KEYWORD_BLOCKING,
    APPLE_SIGN_IN,
    MULTI_DEVICE,
    BLOCKING_CONDITIONS,
  } = FeatureFlagKey

  test('should return default feature flags', () => {
    const store = createTestStore()
    const expectedFlags = {
      [WEBSITE_BLOCKING]: false,
      [KEYWORD_BLOCKING]: false,
      [APPLE_SIGN_IN]: false,
      [MULTI_DEVICE]: false,
      [BLOCKING_CONDITIONS]: false,
    }

    const flags = selectFeatureFlags(store.getState())

    expect(flags).toStrictEqual(expectedFlags)
  })

  describe('when flags are loaded from provider', () => {
    let featureFlagProvider: InMemoryFeatureFlagProvider

    beforeEach(() => {
      featureFlagProvider = new InMemoryFeatureFlagProvider()
      featureFlagProvider.setFlag(WEBSITE_BLOCKING, true)
    })

    test('should return updated flags after loading', async () => {
      const store = createTestStore({ featureFlagProvider })
      const expectedFlags = {
        [WEBSITE_BLOCKING]: true,
        [KEYWORD_BLOCKING]: false,
        [APPLE_SIGN_IN]: false,
        [MULTI_DEVICE]: false,
        [BLOCKING_CONDITIONS]: false,
      }

      await store.dispatch(loadFeatureFlags())
      const flags = selectFeatureFlags(store.getState())

      expect(flags).toStrictEqual(expectedFlags)
    })
  })
})

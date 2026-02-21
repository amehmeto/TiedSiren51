import { beforeEach, describe, expect, test } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { FeatureFlagKey } from '@/feature-flags'
import { InMemoryFeatureFlagProvider } from '@/infra/feature-flag-provider/in-memory.feature-flag.provider'
import { loadFeatureFlags } from './load-feature-flags.usecase'

describe('loadFeatureFlags usecase', () => {
  const { WEBSITE_BLOCKING, KEYWORD_BLOCKING, APPLE_SIGN_IN } = FeatureFlagKey
  let featureFlagProvider: InMemoryFeatureFlagProvider

  beforeEach(() => {
    featureFlagProvider = new InMemoryFeatureFlagProvider()
  })

  test('should load default feature flags', async () => {
    const store = createTestStore({ featureFlagProvider })
    const expectedFlags = {
      [WEBSITE_BLOCKING]: false,
      [KEYWORD_BLOCKING]: false,
      [APPLE_SIGN_IN]: false,
    }

    await store.dispatch(loadFeatureFlags())

    const { flags } = store.getState().featureFlag
    expect(flags).toStrictEqual(expectedFlags)
  })

  test('should load enabled feature flags from provider', async () => {
    featureFlagProvider.setFlag(WEBSITE_BLOCKING, true)
    featureFlagProvider.setFlag(APPLE_SIGN_IN, true)
    const store = createTestStore({ featureFlagProvider })
    const expectedFlags = {
      [WEBSITE_BLOCKING]: true,
      [KEYWORD_BLOCKING]: false,
      [APPLE_SIGN_IN]: true,
    }

    await store.dispatch(loadFeatureFlags())

    const { flags } = store.getState().featureFlag
    expect(flags).toStrictEqual(expectedFlags)
  })
})

import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { FeatureFlagKey, FeatureFlagValues } from '@/feature-flags'

export const loadFeatureFlags = createAppAsyncThunk<FeatureFlagValues>(
  'featureFlag/load',
  async (_, { extra: { featureFlagProvider } }) => {
    const {
      WEBSITE_BLOCKING,
      KEYWORD_BLOCKING,
      APPLE_SIGN_IN,
      MULTI_DEVICE,
      BLOCKING_CONDITIONS,
    } = FeatureFlagKey

    await featureFlagProvider.fetchAndActivate()

    return {
      [WEBSITE_BLOCKING]: featureFlagProvider.getBoolean(WEBSITE_BLOCKING),
      [KEYWORD_BLOCKING]: featureFlagProvider.getBoolean(KEYWORD_BLOCKING),
      [APPLE_SIGN_IN]: featureFlagProvider.getBoolean(APPLE_SIGN_IN),
      [MULTI_DEVICE]: featureFlagProvider.getBoolean(MULTI_DEVICE),
      [BLOCKING_CONDITIONS]:
        featureFlagProvider.getBoolean(BLOCKING_CONDITIONS),
    }
  },
)

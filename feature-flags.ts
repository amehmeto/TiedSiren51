enum FeatureFlagKey {
  WEBSITE_BLOCKING = 'WEBSITE_BLOCKING',
  KEYWORD_BLOCKING = 'KEYWORD_BLOCKING',
  APPLE_SIGN_IN = 'APPLE_SIGN_IN',
}

export const FeatureFlags: Record<FeatureFlagKey, boolean> = {
  [FeatureFlagKey.WEBSITE_BLOCKING]: false,
  [FeatureFlagKey.KEYWORD_BLOCKING]: false,
  [FeatureFlagKey.APPLE_SIGN_IN]: false,
}

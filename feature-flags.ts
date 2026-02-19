enum FeatureFlagKey {
  WEBSITE_BLOCKING = 'WEBSITE_BLOCKING',
  KEYWORD_BLOCKING = 'KEYWORD_BLOCKING',
}

export const FeatureFlags: Record<FeatureFlagKey, boolean> = {
  [FeatureFlagKey.WEBSITE_BLOCKING]: false,
  [FeatureFlagKey.KEYWORD_BLOCKING]: false,
}

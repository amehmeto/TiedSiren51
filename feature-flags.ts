export enum FeatureFlagKey {
  WEBSITE_BLOCKING = 'WEBSITE_BLOCKING',
  KEYWORD_BLOCKING = 'KEYWORD_BLOCKING',
  APPLE_SIGN_IN = 'APPLE_SIGN_IN',
}

export type FeatureFlagValues = Record<FeatureFlagKey, boolean>

export const DEFAULT_FEATURE_FLAGS: FeatureFlagValues = {
  [FeatureFlagKey.WEBSITE_BLOCKING]: false,
  [FeatureFlagKey.KEYWORD_BLOCKING]: false,
  [FeatureFlagKey.APPLE_SIGN_IN]: false,
}

import { FeatureFlagKey } from '@/feature-flags'

export interface FeatureFlagProvider {
  fetchAndActivate(): Promise<void>
  getBoolean(key: FeatureFlagKey): boolean
}

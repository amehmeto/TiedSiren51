import { FeatureFlagProvider } from '@/core/_ports_/feature-flag.provider'
import {
  DEFAULT_FEATURE_FLAGS,
  FeatureFlagKey,
  FeatureFlagValues,
} from '@/feature-flags'

export class InMemoryFeatureFlagProvider implements FeatureFlagProvider {
  private flags: FeatureFlagValues = { ...DEFAULT_FEATURE_FLAGS }

  async fetchAndActivate(): Promise<void> {
    // No-op for in-memory provider
  }

  getBoolean(key: FeatureFlagKey): boolean {
    return this.flags[key]
  }

  setFlag(key: FeatureFlagKey, isEnabled: boolean): void {
    this.flags[key] = isEnabled
  }
}

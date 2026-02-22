import { FeatureFlagProvider } from '@/core/_ports_/feature-flag.provider'
import {
  DEFAULT_FEATURE_FLAGS,
  FeatureFlagKey,
  FeatureFlagValues,
} from '@/feature-flags'

export class InMemoryFeatureFlagProvider implements FeatureFlagProvider {
  private flags: FeatureFlagValues = { ...DEFAULT_FEATURE_FLAGS }

  private shouldThrow = false

  simulateError(): void {
    this.shouldThrow = true
  }

  async fetchAndActivate(): Promise<void> {
    if (this.shouldThrow)
      throw new Error('Simulated fetch error for feature flags')
  }

  getBoolean(key: FeatureFlagKey): boolean {
    return this.flags[key]
  }

  setFlag(key: FeatureFlagKey, isEnabled: boolean): void {
    this.flags[key] = isEnabled
  }
}

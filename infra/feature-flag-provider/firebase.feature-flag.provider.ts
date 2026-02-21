import { getApp, getApps, initializeApp } from 'firebase/app'
import {
  fetchAndActivate,
  getRemoteConfig,
  getValue,
  RemoteConfig,
} from 'firebase/remote-config'
import { FeatureFlagProvider } from '@/core/_ports_/feature-flag.provider'
import { Logger } from '@/core/_ports_/logger'
import { DEFAULT_FEATURE_FLAGS, FeatureFlagKey } from '@/feature-flags'
import { firebaseConfig } from '../auth-gateway/firebaseConfig'

export class FirebaseFeatureFlagProvider implements FeatureFlagProvider {
  private readonly remoteConfig: RemoteConfig

  constructor(private readonly logger: Logger) {
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
    this.remoteConfig = getRemoteConfig(app)
    this.remoteConfig.defaultConfig = DEFAULT_FEATURE_FLAGS
  }

  async fetchAndActivate(): Promise<void> {
    try {
      await fetchAndActivate(this.remoteConfig)
    } catch (error) {
      this.logger.error(
        `[FirebaseFeatureFlagProvider] Failed to fetch remote config: ${error}`,
      )
      throw error
    }
  }

  getBoolean(key: FeatureFlagKey): boolean {
    try {
      return getValue(this.remoteConfig, key).asBoolean()
    } catch (error) {
      this.logger.error(
        `[FirebaseFeatureFlagProvider] Failed to get value for ${key}: ${error}`,
      )
      throw error
    }
  }
}

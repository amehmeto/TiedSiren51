import * as AccessibilityService from '@amehmeto/expo-accessibility-service'
import type { AccessibilityEventSubscription } from '@amehmeto/expo-accessibility-service'
import { setBlockedApps } from '@amehmeto/tied-siren-blocking-overlay'
import { Logger } from '@/core/_ports_/logger'
import { AndroidSirenLookout, DetectedSiren } from '@core/_ports_/siren.lookout'

export class RealAndroidSirenLookout implements AndroidSirenLookout {
  private listener?: (siren: DetectedSiren) => void

  private subscription?: AccessibilityEventSubscription

  constructor(private readonly logger: Logger) {}

  async initialize(): Promise<void> {
    try {
      this.logger.info('[RealAndroidSirenLookout] Initialized')
      // Actual initialization happens in startWatching for backwards compatibility
      // In the future, this will set up the native listeners via reflection
    } catch (error) {
      this.logger.error(
        `[RealAndroidSirenLookout] Failed to initialize: ${error}`,
      )
      throw error
    }
  }

  onSirenDetected(listener: (siren: DetectedSiren) => void): void {
    if (this.listener) {
      this.logger.warn(
        '[RealAndroidSirenLookout] Overwriting existing siren detection listener. Previous listener will be discarded.',
      )
    }
    this.listener = listener
  }

  /** @deprecated Use initialize for setup. Will be removed in native-to-native blocking migration. */
  startWatching(): void {
    // Start subscription if not already active
    if (!this.subscription) this.startAccessibilitySubscription()
  }

  /** @deprecated Will be removed in native-to-native blocking migration. */
  stopWatching(): void {
    if (this.subscription) {
      this.subscription.remove()
      this.subscription = undefined
      this.logger.info('Stopped watching for sirens')
    }
  }

  async isEnabled(): Promise<boolean> {
    try {
      return await AccessibilityService.isEnabled()
    } catch (error) {
      this.logger.error(
        `[RealAndroidSirenLookout] Failed to check if accessibility service is enabled: ${error}`,
      )
      return false
    }
  }

  async askPermission(): Promise<void> {
    try {
      await AccessibilityService.askPermission()
    } catch (error) {
      this.logger.error(
        `[RealAndroidSirenLookout] Failed to ask for accessibility permission: ${error}`,
      )
      throw error
    }
  }

  /** @deprecated Will be removed in native-to-native blocking migration. */
  async updateBlockedApps(packageNames: string[]): Promise<void> {
    try {
      await setBlockedApps(packageNames)
      this.logger.info(
        `Blocked apps synced to native: count=${packageNames.length}`,
      )
    } catch (error) {
      this.logger.error(
        `[RealAndroidSirenLookout] Failed to sync blocked apps: ${error}`,
      )
      throw error
    }
  }

  private startAccessibilitySubscription(): void {
    try {
      this.subscription = AccessibilityService.addAccessibilityEventListener(
        (event) => {
          const packageName = event.packageName
          if (!packageName) return

          this.logger.info(`Detected app launch: ${packageName}`)

          // Notify the listener with DetectedSiren format
          if (this.listener) {
            this.listener({
              type: 'app',
              identifier: packageName,
              timestamp: Date.now(),
            })
          }
        },
      )

      this.logger.info('Started accessibility event subscription')
    } catch (error) {
      this.logger.error(
        `[RealAndroidSirenLookout] Failed to start accessibility subscription: ${error}`,
      )
      throw error
    }
  }
}

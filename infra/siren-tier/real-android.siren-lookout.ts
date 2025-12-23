import * as AccessibilityService from '@amehmeto/expo-accessibility-service'
import type { AccessibilityEventSubscription } from '@amehmeto/expo-accessibility-service'
import { setBlockedApps } from '@amehmeto/tied-siren-blocking-overlay'
import { Logger } from '@/core/_ports_/logger'
import { AndroidSirenLookout } from '@core/_ports_/siren.lookout'

export class RealAndroidSirenLookout implements AndroidSirenLookout {
  private listener?: (packageName: string) => void

  private subscription?: AccessibilityEventSubscription

  constructor(private readonly logger: Logger) {}

  startWatching(): void {
    // Start subscription if not already active
    if (!this.subscription) this.startAccessibilitySubscription()
  }

  stopWatching(): void {
    if (this.subscription) {
      this.subscription.remove()
      this.subscription = undefined
      this.logger.info('Stopped watching for sirens')
    }
  }

  onSirenDetected(listener: (packageName: string) => void): void {
    if (this.listener) {
      this.logger.warn(
        '[RealAndroidSirenLookout] Overwriting existing siren detection listener. Previous listener will be discarded.',
      )
    }
    this.listener = listener
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

          // Notify the listener regardless of whether it's a siren
          // The business logic (blockLaunchedApp usecase) will decide if blocking is needed
          if (this.listener) this.listener(packageName)
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

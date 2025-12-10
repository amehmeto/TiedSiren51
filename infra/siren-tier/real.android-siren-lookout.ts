import * as AccessibilityService from '@amehmeto/expo-accessibility-service'
import type { AccessibilityEventSubscription } from '@amehmeto/expo-accessibility-service'
import { Logger } from '@/core/_ports_/logger'
import { Sirens } from '@/core/siren/sirens'
import { AndroidSirenLookout } from '@core/_ports_/siren.lookout'

export class RealAndroidSirenLookout implements AndroidSirenLookout {
  private listener?: (packageName: string) => void

  private subscription?: AccessibilityEventSubscription

  constructor(private readonly logger: Logger) {}

  watchSirens(sirens: Sirens): void {
    this.logger.info(
      `Watching sirens: ${sirens.android.map((app) => app.appName).join(', ')}`,
    )

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
    this.listener = listener
  }

  async isEnabled(): Promise<boolean> {
    try {
      return await AccessibilityService.isEnabled()
    } catch (error) {
      this.logger.error(
        `Failed to check if accessibility service is enabled: ${error}`,
      )
      return false
    }
  }

  async askPermission(): Promise<void> {
    try {
      await AccessibilityService.askPermission()
    } catch (error) {
      this.logger.error(`Failed to ask for accessibility permission: ${error}`)
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
      this.logger.error(`Failed to start accessibility subscription: ${error}`)
    }
  }
}

import type { AccessibilityEventSubscription } from '@amehmeto/expo-accessibility-service'
import * as AccessibilityService from '@amehmeto/expo-accessibility-service'
import { Logger } from '@/core/_ports_/logger'
import { AndroidSirenLookout } from '@/core/_ports_/siren.lookout'

export class AccessibilityServiceSirenLookout implements AndroidSirenLookout {
  private listener?: (packageName: string) => void

  private subscription?: AccessibilityEventSubscription

  constructor(private readonly logger: Logger) {}

  startWatching(): void {
    try {
      if (this.subscription) {
        this.logger.info('Already watching for sirens')
        return
      }

      this.subscription = AccessibilityService.addAccessibilityEventListener(
        (event) => {
          const packageName = event.packageName
          if (!packageName) return

          this.logger.info(`Detected app launch: ${packageName}`)

          if (this.listener) this.listener(packageName)
        },
      )

      this.logger.info('Started accessibility event subscription')
    } catch (error) {
      this.logger.error(`Failed to start accessibility subscription: ${error}`)
    }
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
        'Overwriting existing siren detection listener. Previous listener will be discarded.',
      )
    }
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
}

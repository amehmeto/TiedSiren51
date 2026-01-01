import { setCallbackClass } from '@amehmeto/expo-foreground-service'
import {
  BLOCKING_CALLBACK_CLASS,
  showOverlay,
} from '@amehmeto/tied-siren-blocking-overlay'
import { Logger } from '@/core/_ports_/logger'
import {
  BlockingSchedule,
  SirenTier,
} from '@core/_ports_/siren.tier'

export class AndroidSirenTier implements SirenTier {
  constructor(private readonly logger: Logger) {}

  async initialize(): Promise<void> {
    try {
      await setCallbackClass(BLOCKING_CALLBACK_CLASS)
      this.logger.info('[AndroidSirenTier] Native blocking initialized')
    } catch (error) {
      this.logger.error(
        `[AndroidSirenTier] Failed to initialize native blocking: ${error}`,
      )
      return // Graceful degradation: app continues without native blocking
    }
  }

  async setBlockingSchedule(schedule: BlockingSchedule): Promise<void> {
    this.logger.info(
      `[AndroidSirenTier] Received blocking schedule with ${schedule.windows.length} windows`,
    )
    // TODO: Implement native scheduling via AlarmManager and SharedPreferences
    // This will be implemented in issue #182
    // For now, log the schedule for debugging
    schedule.windows.forEach((window) => {
      this.logger.info(
        `  Window ${window.id}: ${window.startTime}-${window.endTime}, apps: ${window.sirens.apps.length}, websites: ${window.sirens.websites.length}, keywords: ${window.sirens.keywords.length}`,
      )
    })
  }

  /** @deprecated Use setBlockingSchedule instead. Will be removed in native-to-native blocking migration. */
  async block(packageName: string): Promise<void> {
    try {
      await showOverlay(packageName)
      this.logger.info(`Blocking overlay shown for: ${packageName}`)
    } catch (error) {
      this.logger.error(
        `[AndroidSirenTier] Failed to show blocking overlay for ${packageName}: ${error}`,
      )
      throw error
    }
  }

  /** @deprecated Use initialize instead */
  async initializeNativeBlocking(): Promise<void> {
    await this.initialize()
  }
}

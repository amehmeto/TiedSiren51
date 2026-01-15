import { setCallbackClass } from '@amehmeto/expo-foreground-service'
import {
  BLOCKING_CALLBACK_CLASS,
  setBlockedApps,
} from '@amehmeto/tied-siren-blocking-overlay'
import { Logger } from '@/core/_ports_/logger'
import { BlockingSchedule, SirenTier } from '@core/_ports_/siren.tier'

export class AndroidSirenTier implements SirenTier {
  constructor(private readonly logger: Logger) {}

  async initializeNativeBlocking(): Promise<void> {
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

  async updateBlockingSchedule(schedule: BlockingSchedule[]): Promise<void> {
    try {
      const packageNames = schedule.flatMap((s) =>
        s.sirens.android.map((app) => app.packageName),
      )
      await setBlockedApps(packageNames)
      this.logger.info(
        `[AndroidSirenTier] Blocking schedule updated: ${schedule.length} schedules, ${packageNames.length} apps: ${packageNames.join(', ')}`,
      )
    } catch (error) {
      this.logger.error(
        `[AndroidSirenTier] Failed to update blocking schedule: ${error}`,
      )
      throw error
    }
  }
}

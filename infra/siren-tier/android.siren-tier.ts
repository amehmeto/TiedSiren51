import { setCallbackClass } from '@amehmeto/expo-foreground-service'
import { BLOCKING_CALLBACK_CLASS } from '@amehmeto/tied-siren-blocking-overlay'
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

  async block(schedules: BlockingSchedule[]): Promise<void> {
    try {
      this.logger.info(
        `[AndroidSirenTier] Received ${schedules.length} blocking schedules`,
      )
      schedules.forEach((schedule) => {
        this.logger.info(
          `[AndroidSirenTier]   Schedule ${schedule.id}: ${schedule.startTime}-${schedule.endTime}`,
        )
      })
    } catch (error) {
      this.logger.error(
        `[AndroidSirenTier] Failed to set blocking schedule: ${error}`,
      )
      throw error
    }
  }
}

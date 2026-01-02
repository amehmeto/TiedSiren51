import { setCallbackClass } from '@amehmeto/expo-foreground-service'
import { BLOCKING_CALLBACK_CLASS } from '@amehmeto/tied-siren-blocking-overlay'
import { Logger } from '@/core/_ports_/logger'
import { BlockingWindow, SirenTier } from '@core/_ports_/siren.tier'

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

  async block(schedule: BlockingWindow[]): Promise<void> {
    try {
      this.logger.info(
        `[AndroidSirenTier] Received blocking schedule with ${schedule.length} windows`,
      )
      schedule.forEach((window) => {
        this.logger.info(
          `[AndroidSirenTier]   Window ${window.id}: ${window.startTime}-${window.endTime}`,
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

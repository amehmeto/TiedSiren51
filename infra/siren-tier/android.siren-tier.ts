import { setCallbackClass } from '@amehmeto/expo-foreground-service'
import {
  BlockingWindow,
  BLOCKING_CALLBACK_CLASS,
  setBlockedApps,
  setBlockingSchedule,
} from '@amehmeto/tied-siren-blocking-overlay'
import { assertISODateString } from '@/core/_ports_/date-provider'
import { Logger } from '@/core/_ports_/logger'
import { BlockingSchedule, SirenTier } from '@core/_ports_/siren.tier'

/**
 * Converts BlockingSchedule array to native BlockingWindow format.
 * Passes ISO timestamps directly to Kotlin (Kotlin handles time conversion internally).
 */
export function toNativeBlockingWindows(
  schedules: BlockingSchedule[],
): BlockingWindow[] {
  return schedules.map((schedule) => {
    assertISODateString(schedule.startTime)
    assertISODateString(schedule.endTime)
    return {
      id: schedule.id,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      packageNames: schedule.sirens.android.map((app) => app.packageName),
    }
  })
}

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
      const nativeWindows = toNativeBlockingWindows(schedule)
      await setBlockingSchedule(nativeWindows)

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

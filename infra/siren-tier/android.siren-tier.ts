import { setCallbackClass } from '@amehmeto/expo-foreground-service'
import {
  BlockingWindow,
  BLOCKING_CALLBACK_CLASS,
  setBlockedApps,
  setBlockingSchedule,
} from '@amehmeto/tied-siren-blocking-overlay'
import { Logger } from '@/core/_ports_/logger'
import { BlockingSchedule, SirenTier } from '@core/_ports_/siren.tier'

/**
 * Converts BlockingSchedule array to native BlockingWindow format.
 * Extracts HH:mm time from ISO timestamps and maps Android sirens to package names.
 */
export function toNativeBlockingWindows(
  schedules: BlockingSchedule[],
): BlockingWindow[] {
  return schedules.map((schedule) => ({
    id: schedule.id,
    startTime: extractTimeFromISO(schedule.startTime),
    endTime: extractTimeFromISO(schedule.endTime),
    packageNames: schedule.sirens.android.map((app) => app.packageName),
  }))
}

/**
 * Extracts HH:mm time from an ISO timestamp in device-local timezone.
 * Uses local time intentionally: users set schedules in their local timezone,
 * and the native layer compares against device's local time.
 * Example: "2024-01-15T14:30:00.000Z" -> "15:30" (if device is UTC+1)
 */
function extractTimeFromISO(isoString: string): string {
  const date = new Date(isoString)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
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
        `[AndroidSirenTier] Blocking schedule updated: ${schedule.length} schedules, ${packageNames.length} apps`,
      )
    } catch (error) {
      this.logger.error(
        `[AndroidSirenTier] Failed to update blocking schedule: ${error}`,
      )
      throw error
    }
  }
}

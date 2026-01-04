import { NativeBlockingWindow } from '@/infra/siren-tier/android.siren-tier'

declare module '@amehmeto/tied-siren-blocking-overlay' {
  /**
   * Sets the blocking schedule with time windows for the native blocking scheduler.
   * The native layer uses AlarmManager to schedule exact alarms for each window.
   *
   * @param windows - Array of blocking windows in native format
   * @throws ERR_NO_CONTEXT - If React context is not available
   */
  export function setBlockingSchedule(
    windows: NativeBlockingWindow[],
  ): Promise<void>
}

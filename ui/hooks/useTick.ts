import { useEffect, useState } from 'react'
import { SECOND } from '@/core/__constants__/time'

/**
 * A hook that triggers re-renders at a specified interval.
 *
 * Useful for time-based UI updates like countdowns or elapsed time displays.
 * The hook manages the interval lifecycle (setup and cleanup) internally.
 *
 * @param intervalMs - The interval in milliseconds between ticks. Defaults to 1 second.
 * @param enabled - Whether the tick should be active. Defaults to true.
 * @returns The current tick count (increments each interval).
 *
 * @example
 * // Re-render every second
 * const tick = useTick()
 *
 * @example
 * // Re-render every 500ms, only when timer is active
 * const tick = useTick(500, isTimerActive)
 */
export function useTick(
  intervalMs: number = 1 * SECOND,
  isEnabled = true,
): number {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!isEnabled) return

    const intervalId = setInterval(() => {
      setTick((t) => t + 1)
    }, intervalMs)

    return () => clearInterval(intervalId)
  }, [intervalMs, isEnabled])

  return tick
}

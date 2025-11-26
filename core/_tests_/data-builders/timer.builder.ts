import type { PartialDeep } from 'type-fest'
import { Timer } from '../../timer/timer'
import { TimeUnit } from '../../timer/timer.utils'

export function buildTimer(overrides: PartialDeep<Timer> = {}): Timer {
  const defaultTimer: Timer = {
    duration: TimeUnit.HOUR,
    endAt: TimeUnit.HOUR,
    isActive: true,
  }

  return {
    ...defaultTimer,
    ...overrides,
  }
}

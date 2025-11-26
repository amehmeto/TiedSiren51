import type { PartialDeep } from 'type-fest'
import { Timer } from '../../timer/timer'
import { TimeUnit } from '../../timer/timer.utils'

export function buildTimer(overrides: PartialDeep<Timer> = {}): Timer {
  const defaultTimer: Timer = {
    endAt: TimeUnit.HOUR,
  }

  return {
    ...defaultTimer,
    ...overrides,
  }
}

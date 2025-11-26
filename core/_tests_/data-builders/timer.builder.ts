import type { PartialDeep } from 'type-fest'
import { Timer } from '../../timer/timer'
import { TimeUnit } from '../../timer/timer.utils'

type TimerOverrides = PartialDeep<Timer> & {
  baseTime?: number
}

export function buildTimer(overrides: TimerOverrides = {}): Timer {
  const { baseTime = 0, ...timerOverrides } = overrides
  const duration = timerOverrides.duration ?? TimeUnit.HOUR

  const defaultTimer: Timer = {
    duration,
    endTime: baseTime + duration,
    isActive: true,
  }

  return {
    ...defaultTimer,
    ...timerOverrides,
  }
}

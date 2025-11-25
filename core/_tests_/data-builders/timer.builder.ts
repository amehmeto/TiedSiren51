import type { PartialDeep } from 'type-fest'
import { Timer } from '../../timer/timer'
import { TimeUnit } from '../../timer/timer.utils'

const DEFAULT_BASE_TIME = 0

export type TimerBuilderOptions = {
  baseTime?: number
}

const resolveBaseTime = (options?: TimerBuilderOptions) =>
  options?.baseTime ?? DEFAULT_BASE_TIME

export function buildTimer(wantedTimer: PartialDeep<Timer> = {}): Timer {
  const defaultDuration = TimeUnit.HOUR // 1 hour default

  const defaultTimer: Timer = {
    endTime: defaultDuration,
    duration: defaultDuration,
    isActive: true,
  }

  return {
    ...defaultTimer,
    ...wantedTimer,
  }
}

export const timerWithRemainingTime = {
  oneHour: (options?: TimerBuilderOptions) => {
    const baseTime = resolveBaseTime(options)
    return buildTimer({
      duration: TimeUnit.HOUR,
      endTime: baseTime + TimeUnit.HOUR,
    })
  },

  thirtyMinutes: (options?: TimerBuilderOptions) => {
    const baseTime = resolveBaseTime(options)
    return buildTimer({
      duration: TimeUnit.MINUTE * 30,
      endTime: baseTime + TimeUnit.MINUTE * 30,
    })
  },

  fortyFiveSeconds: (options?: TimerBuilderOptions) => {
    const baseTime = resolveBaseTime(options)
    return buildTimer({
      duration: TimeUnit.SECOND * 45,
      endTime: baseTime + TimeUnit.SECOND * 45,
    })
  },

  oneDayTwoHoursThirtyMinutesFortyFiveSeconds: (
    options?: TimerBuilderOptions,
  ) => {
    const baseTime = resolveBaseTime(options)
    const duration =
      TimeUnit.DAY +
      TimeUnit.HOUR * 2 +
      TimeUnit.MINUTE * 30 +
      TimeUnit.SECOND * 45
    return buildTimer({
      duration,
      endTime: baseTime + duration,
    })
  },

  sixtyOneSeconds: (options?: TimerBuilderOptions) => {
    const baseTime = resolveBaseTime(options)
    return buildTimer({
      duration: TimeUnit.SECOND * 61,
      endTime: baseTime + TimeUnit.SECOND * 61,
    })
  },

  sixtySeconds: (options?: TimerBuilderOptions) => {
    const baseTime = resolveBaseTime(options)
    return buildTimer({
      duration: TimeUnit.MINUTE,
      endTime: baseTime + TimeUnit.MINUTE,
    })
  },

  fiftyNineSeconds: (options?: TimerBuilderOptions) => {
    const baseTime = resolveBaseTime(options)
    return buildTimer({
      duration: TimeUnit.SECOND * 59,
      endTime: baseTime + TimeUnit.SECOND * 59,
    })
  },

  oneHourOneMinuteOneSecond: (options?: TimerBuilderOptions) => {
    const baseTime = resolveBaseTime(options)
    const duration = TimeUnit.HOUR + TimeUnit.MINUTE + TimeUnit.SECOND
    return buildTimer({
      duration,
      endTime: baseTime + duration,
    })
  },

  twoMinutesFiveSeconds: (options?: TimerBuilderOptions) => {
    const baseTime = resolveBaseTime(options)
    const duration = TimeUnit.MINUTE * 2 + TimeUnit.SECOND * 5
    return buildTimer({
      duration,
      endTime: baseTime + duration,
    })
  },

  expired: (options?: TimerBuilderOptions) => {
    const baseTime = resolveBaseTime(options)
    return buildTimer({
      duration: TimeUnit.HOUR,
      endTime: baseTime - TimeUnit.SECOND,
      isActive: true,
    })
  },

  inactive: (options?: TimerBuilderOptions) => {
    const baseTime = resolveBaseTime(options)
    return buildTimer({
      duration: TimeUnit.HOUR,
      endTime: baseTime + TimeUnit.HOUR,
      isActive: false,
    })
  },
}

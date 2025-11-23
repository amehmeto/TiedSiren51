import type { PartialDeep } from 'type-fest'
import { Timer } from '../../timer/timer'
import { TimeUnit } from '../../timer/timer.utils'

export function buildTimer(wantedTimer: PartialDeep<Timer> = {}): Timer {
  const now = Date.now()
  const defaultDuration = TimeUnit.HOUR // 1 hour default

  const defaultTimer: Timer = {
    endTime: now + defaultDuration,
    duration: defaultDuration,
    isActive: true,
  }

  return {
    ...defaultTimer,
    ...wantedTimer,
  }
}

export const timerWithRemainingTime = {
  oneHour: () => {
    const now = Date.now()
    return buildTimer({
      duration: TimeUnit.HOUR,
      endTime: now + TimeUnit.HOUR,
    })
  },

  thirtyMinutes: () => {
    const now = Date.now()
    return buildTimer({
      duration: TimeUnit.MINUTE * 30,
      endTime: now + TimeUnit.MINUTE * 30,
    })
  },

  fortyFiveSeconds: () => {
    const now = Date.now()
    return buildTimer({
      duration: TimeUnit.SECOND * 45,
      endTime: now + TimeUnit.SECOND * 45,
    })
  },

  oneDayTwoHoursThirtyMinutesFortyFiveSeconds: () => {
    const now = Date.now()
    const duration =
      TimeUnit.DAY +
      TimeUnit.HOUR * 2 +
      TimeUnit.MINUTE * 30 +
      TimeUnit.SECOND * 45
    return buildTimer({
      duration,
      endTime: now + duration,
    })
  },

  sixtyOneSeconds: () => {
    const now = Date.now()
    return buildTimer({
      duration: TimeUnit.SECOND * 61,
      endTime: now + TimeUnit.SECOND * 61,
    })
  },

  sixtySeconds: () => {
    const now = Date.now()
    return buildTimer({
      duration: TimeUnit.MINUTE,
      endTime: now + TimeUnit.MINUTE,
    })
  },

  fiftyNineSeconds: () => {
    const now = Date.now()
    return buildTimer({
      duration: TimeUnit.SECOND * 59,
      endTime: now + TimeUnit.SECOND * 59,
    })
  },

  oneHourOneMinuteOneSecond: () => {
    const now = Date.now()
    const duration = TimeUnit.HOUR + TimeUnit.MINUTE + TimeUnit.SECOND
    return buildTimer({
      duration,
      endTime: now + duration,
    })
  },

  twoMinutesFiveSeconds: () => {
    const now = Date.now()
    const duration = TimeUnit.MINUTE * 2 + TimeUnit.SECOND * 5
    return buildTimer({
      duration,
      endTime: now + duration,
    })
  },

  expired: () => {
    const now = Date.now()
    return buildTimer({
      duration: TimeUnit.HOUR,
      endTime: now - TimeUnit.SECOND,
      isActive: true,
    })
  },

  inactive: () => {
    const now = Date.now()
    return buildTimer({
      duration: TimeUnit.HOUR,
      endTime: now + TimeUnit.HOUR,
      isActive: false,
    })
  },
}

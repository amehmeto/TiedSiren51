import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { Timer } from '../timer'
import { calculateMilliseconds, TimeUnit } from '../timer.utils'

const MAX_DURATION_MS = 30 * TimeUnit.DAY

export type ExtendTimerPayload = {
  days: number
  hours: number
  minutes: number
  now: number
}

export const extendTimer = createAppAsyncThunk<Timer, ExtendTimerPayload>(
  'timer/extendTimer',
  async (payload, { extra: { timerRepository }, getState }) => {
    const userId = getState().auth.authUser?.id
    if (!userId) throw new Error('User not authenticated')

    const currentTimer = getState().timer.timer

    if (!currentTimer?.isActive) throw new Error('No active timer to extend')

    const additionalMs = calculateMilliseconds(payload)

    if (additionalMs <= 0) throw new Error('Invalid extension duration')

    const newTotalDuration = currentTimer.duration + additionalMs
    if (newTotalDuration > MAX_DURATION_MS) {
      throw new Error(
        'Extended timer duration exceeds maximum allowed (30 days)',
      )
    }

    const newEndAt = currentTimer.endAt + additionalMs

    const updatedTimer: Timer = {
      endAt: newEndAt,
      duration: currentTimer.duration + additionalMs,
      isActive: true,
    }

    await timerRepository.saveTimer(userId, updatedTimer)
    return updatedTimer
  },
)

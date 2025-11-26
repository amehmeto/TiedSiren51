import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { Timer } from '../timer'
import { calculateMilliseconds, TimeUnit } from '../timer.utils'

const MAX_DURATION_MS = 30 * TimeUnit.DAY

export type StartTimerPayload = {
  days: number
  hours: number
  minutes: number
  now: number
}

export const startTimer = createAppAsyncThunk<Timer, StartTimerPayload>(
  'timer/startTimer',
  async (payload, { extra: { timerRepository }, getState }) => {
    const userId = getState().auth.authUser?.id
    if (!userId) throw new Error('User not authenticated')

    const durationMs = calculateMilliseconds(payload)

    if (durationMs <= 0) throw new Error('Invalid timer duration')
    if (durationMs > MAX_DURATION_MS)
      throw new Error('Timer duration exceeds maximum allowed (30 days)')

    const endAt = payload.now + durationMs

    const timer: Timer = {
      endAt,
      isActive: true,
    }

    await timerRepository.saveTimer(userId, timer)
    return timer
  },
)

import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { calculateMilliseconds, TimeUnit } from '../timer.utils'

const MAX_DURATION_MS = 30 * TimeUnit.DAY

export type StartTimerPayload = {
  days: number
  hours: number
  minutes: number
}

export const startTimer = createAppAsyncThunk<string, StartTimerPayload>(
  'timer/startTimer',
  async (payload, { extra: { timerRepository, dateProvider }, getState }) => {
    const userId = getState().auth.authUser?.id
    if (!userId) throw new Error('User not authenticated')

    const durationMs = calculateMilliseconds(payload)

    if (durationMs <= 0) throw new Error('Invalid timer duration')
    if (durationMs > MAX_DURATION_MS)
      throw new Error('Timer duration exceeds maximum allowed (30 days)')

    const endAt = dateProvider.msToISOString(
      dateProvider.getNowMs() + durationMs,
    )

    await timerRepository.saveTimer(userId, endAt)
    return endAt
  },
)

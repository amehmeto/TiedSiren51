import { DAY } from '@/core/__constants__/time'
import { calculateMilliseconds } from '@/core/__utils__/time.utils'
import { ISODateString } from '@/core/_ports_/port.date-provider'
import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'

const MAX_DURATION_MS = 30 * DAY

export type StartTimerPayload = {
  days: number
  hours: number
  minutes: number
}

export const startTimer = createAppAsyncThunk<ISODateString, StartTimerPayload>(
  'timer/startTimer',
  async (payload, { extra: { timerRepository, dateProvider }, getState }) => {
    const userId = getState().auth.authUser?.id
    if (!userId) throw new Error('User not authenticated')

    const durationMs = calculateMilliseconds(payload)

    if (durationMs <= 0) throw new Error('Invalid timer duration')
    if (durationMs > MAX_DURATION_MS)
      throw new Error('Timer duration exceeds maximum allowed (30 days)')

    const endedAt = dateProvider.msToISOString(
      dateProvider.getNowMs() + durationMs,
    )

    await timerRepository.saveTimer(userId, endedAt)
    return endedAt
  },
)

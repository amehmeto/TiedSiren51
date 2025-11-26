import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { calculateMilliseconds, TimeUnit } from '../timer.utils'

const MAX_DURATION_MS = 30 * TimeUnit.DAY

export type ExtendTimerPayload = {
  days: number
  hours: number
  minutes: number
}

export const extendTimer = createAppAsyncThunk<string, ExtendTimerPayload>(
  'timer/extendTimer',
  async (payload, { extra: { timerRepository, dateProvider }, getState }) => {
    const userId = getState().auth.authUser?.id
    if (!userId) throw new Error('User not authenticated')

    const nowMs = dateProvider.getNowMs()
    const currentEndAt = getState().timer.endAt
    const currentEndAtMs = currentEndAt
      ? dateProvider.parseISOString(currentEndAt).getTime()
      : 0

    if (!currentEndAt || currentEndAtMs <= nowMs)
      throw new Error('No active timer to extend')

    const additionalMs = calculateMilliseconds(payload)
    if (additionalMs <= 0) throw new Error('Invalid extension duration')

    const remainingMs = currentEndAtMs - nowMs
    const newTotalDuration = remainingMs + additionalMs
    if (newTotalDuration > MAX_DURATION_MS) {
      throw new Error(
        'Extended timer duration exceeds maximum allowed (30 days)',
      )
    }

    const endAt = dateProvider.msToISOString(currentEndAtMs + additionalMs)

    await timerRepository.saveTimer(userId, endAt)
    return endAt
  },
)

import { DAY } from '@/core/__constants__/time'
import { calculateMilliseconds } from '@/core/__utils__/time.utils'
import { ISODateString } from '@/core/_ports_/date-provider'
import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { selectAuthUserId } from '@/core/auth/selectors/selectAuthUserId'

export type ExtendTimerPayload = {
  days?: number
  hours?: number
  minutes?: number
}

export const extendTimer = createAppAsyncThunk<
  ISODateString,
  ExtendTimerPayload
>(
  'timer/extendTimer',
  async (payload, { extra: { timerRepository, dateProvider }, getState }) => {
    const MAX_DURATION_MS = 30 * DAY
    const userId = selectAuthUserId(getState())

    const nowMs = dateProvider.getNowMs()
    const currentEndedAt = getState().strictMode.endedAt
    const currentEndedAtMs = currentEndedAt
      ? dateProvider.parseISOString(currentEndedAt).getTime()
      : 0

    if (!currentEndedAt || currentEndedAtMs <= nowMs)
      throw new Error('No active timer to extend')

    const additionalMs = calculateMilliseconds(payload)
    if (additionalMs <= 0) throw new Error('Invalid extension duration')

    const remainingMs = currentEndedAtMs - nowMs
    const newTotalDuration = remainingMs + additionalMs
    if (newTotalDuration > MAX_DURATION_MS) {
      throw new Error(
        'Extended timer duration exceeds maximum allowed (30 days)',
      )
    }

    const endedAt = dateProvider.msToISOString(currentEndedAtMs + additionalMs)

    await timerRepository.saveTimer(userId, endedAt)
    return endedAt
  },
)

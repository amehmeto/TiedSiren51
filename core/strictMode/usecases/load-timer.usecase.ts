import { ISODateString } from '@/core/_ports_/port.date-provider'
import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'

export const loadTimer = createAppAsyncThunk<ISODateString | null, void>(
  'timer/loadTimer',
  async (_payload, { extra: { timerRepository, dateProvider }, getState }) => {
    const userId = getState().auth.authUser?.id
    if (!userId) return null

    const endedAt = await timerRepository.loadTimer(userId)
    if (!endedAt) return null

    const isExpired =
      dateProvider.parseISOString(endedAt).getTime() <= dateProvider.getNowMs()

    return isExpired ? null : endedAt
  },
)

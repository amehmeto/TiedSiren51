import { ISODateString } from '@/core/_ports_/date-provider'
import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { selectNullableAuthUserId } from '@/core/auth/selectors/selectNullableAuthUserId'

export const loadTimer = createAppAsyncThunk<ISODateString | null, void>(
  'timer/loadTimer',
  async (_payload, { extra: { timerRepository, dateProvider }, getState }) => {
    const userId = selectNullableAuthUserId(getState())
    if (!userId) return null

    const endedAt = await timerRepository.loadTimer(userId)
    if (!endedAt) return null

    const isExpired =
      dateProvider.parseISOString(endedAt).getTime() <= dateProvider.getNowMs()

    return isExpired ? null : endedAt
  },
)

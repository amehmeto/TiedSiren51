import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { Timer } from '../timer'

export const loadTimer = createAppAsyncThunk<Timer | null, number>(
  'timer/loadTimer',
  async (_now, { extra: { timerRepository }, getState }) => {
    const userId = getState().auth.authUser?.id
    if (!userId) return null
    return timerRepository.loadTimer(userId)
  },
)

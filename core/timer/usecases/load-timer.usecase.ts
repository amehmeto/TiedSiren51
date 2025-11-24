import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { Timer } from '../timer'

export const loadTimer = createAppAsyncThunk<Timer | null, void>(
  'timer/loadTimer',
  async (_, { extra: { timerRepository }, getState }) => {
    const userId = getState().auth.authUser?.id
    if (!userId) return null
    return timerRepository.loadTimer(userId)
  },
)

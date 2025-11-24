import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'

export const stopTimer = createAppAsyncThunk<void, void>(
  'timer/stopTimer',
  async (_, { extra: { timerRepository }, getState }) => {
    const userId = getState().auth.authUser?.id
    if (!userId) throw new Error('User not authenticated')
    await timerRepository.clearTimer(userId)
  },
)

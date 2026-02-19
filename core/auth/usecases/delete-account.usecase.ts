import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { selectAuthUserId } from '../selectors/selectAuthUserId'

export const deleteAccount = createAppAsyncThunk(
  'auth/deleteAccount',
  async (
    _,
    {
      extra: {
        blockSessionRepository,
        blocklistRepository,
        sirensRepository,
        authGateway,
      },
      getState,
    },
  ) => {
    const userId = selectAuthUserId(getState())
    await Promise.all([
      blockSessionRepository.deleteAll(userId),
      blocklistRepository.deleteAll(userId),
      sirensRepository.deleteAllSirens(userId),
    ])
    await authGateway.deleteAccount()
  },
)

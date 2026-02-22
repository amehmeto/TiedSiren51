import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { selectAuthUserId } from '@/core/auth/selectors/selectAuthUserId'

export const deleteAccount = createAppAsyncThunk(
  'auth/deleteAccount',
  async (
    _,
    {
      getState,
      extra: {
        blockSessionRepository,
        blocklistRepository,
        sirensRepository,
        authGateway,
      },
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

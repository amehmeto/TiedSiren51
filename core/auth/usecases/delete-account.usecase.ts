import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'

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
    },
  ) => {
    await blockSessionRepository.deleteAll()
    await blocklistRepository.deleteAll()
    await sirensRepository.deleteAllSirens()
    await authGateway.deleteAccount()
  },
)

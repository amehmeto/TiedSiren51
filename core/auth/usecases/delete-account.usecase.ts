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
    await Promise.all([
      blockSessionRepository.deleteAll(),
      blocklistRepository.deleteAll(),
      sirensRepository.deleteAllSirens(),
    ])
    await authGateway.deleteAccount()
  },
)

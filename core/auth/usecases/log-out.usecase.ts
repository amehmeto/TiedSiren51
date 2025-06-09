import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'

export const logOut = createAppAsyncThunk(
  'auth/logOut',
  async (_, { extra: { authGateway } }) => {
    await authGateway.logOut()
    return null
  },
)

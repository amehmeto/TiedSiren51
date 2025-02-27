import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'

export const logOut = createAppAsyncThunk(
  'auth/logOut',
  (_, { extra: { authGateway } }) => {
    return null
  },
)

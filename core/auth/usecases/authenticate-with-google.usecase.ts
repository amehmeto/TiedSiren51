import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'

export const authenticateWithGoogle = createAppAsyncThunk(
  'auth/authenticateWithGoogle',
  (_, { extra: { authGateway } }) => {
    return authGateway.authenticateWithGoogle()
  },
)

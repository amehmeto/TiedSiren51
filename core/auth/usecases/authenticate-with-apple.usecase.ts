import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'

export const authenticateWithApple = createAppAsyncThunk(
  'auth/authenticateWithApple',
  (_, { extra: { authGateway } }) => {
    return authGateway.authenticateWithApple()
  },
)

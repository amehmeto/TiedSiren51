import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'

export const signInWithApple = createAppAsyncThunk(
  'auth/signInWithApple',
  (_, { extra: { authGateway } }) => {
    return authGateway.signInWithApple()
  },
)

import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { AuthUser } from '../auth-user'

export const signInWithApple = createAppAsyncThunk<AuthUser, void>(
  'auth/signInWithApple',
  async (_, { extra: { authGateway } }) => {
    return authGateway.signInWithApple()
  },
)

import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { AuthUser } from '../authUser'

export const signInWithGoogle = createAppAsyncThunk<AuthUser, void>(
  'auth/signInWithGoogle',
  async (_, { extra: { authGateway } }) => {
    return authGateway.signInWithGoogle()
  },
)

import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { AuthUser } from '../auth-user'
import { LoginCredentials } from '../auth.type'

export const signInWithEmail = createAppAsyncThunk<AuthUser, LoginCredentials>(
  'auth/signInWithEmail',
  async (payload, { extra: { authGateway } }) => {
    return authGateway.signInWithEmail(payload.email, payload.password)
  },
)

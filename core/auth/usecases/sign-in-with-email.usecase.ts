import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { LoginCredentials } from '../authTypes'
import { AuthUser } from '../authUser'

export const signInWithEmail = createAppAsyncThunk<AuthUser, LoginCredentials>(
  'auth/signInWithEmail',
  async (payload, { extra: { authGateway } }) => {
    return authGateway.signInWithEmail(payload.email, payload.password)
  },
)

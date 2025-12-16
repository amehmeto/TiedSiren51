import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { AuthUser } from '../auth-user'
import { SignUpCredentials } from '../auth.type'

export const signUpWithEmail = createAppAsyncThunk<AuthUser, SignUpCredentials>(
  'auth/signUpWithEmail',
  async (payload: SignUpCredentials, { extra: { authGateway } }) => {
    const { email, password } = payload
    return authGateway.signUpWithEmail(email, password)
  },
)

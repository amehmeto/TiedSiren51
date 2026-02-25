import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { AuthUser } from '../auth-user'
import { SignUpCredentials } from '../auth.type'
import { sendVerificationEmail } from './send-verification-email.usecase'

export const signUpWithEmail = createAppAsyncThunk<AuthUser, SignUpCredentials>(
  'auth/signUpWithEmail',
  async (payload: SignUpCredentials, { extra: { authGateway }, dispatch }) => {
    const { email, password } = payload
    const authUser = await authGateway.signUpWithEmail(email, password)
    dispatch(sendVerificationEmail())
    return authUser
  },
)

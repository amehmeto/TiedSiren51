import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { AuthUser } from '../authUser'
import { SignUpCredentials } from '../authTypes'

export const signUpWithEmail = createAppAsyncThunk<
  AuthUser,
  SignUpCredentials,
  { rejectValue: string }
>(
  'auth/signUpWithEmail',
  async (
    payload: SignUpCredentials,
    { extra: { authGateway }, rejectWithValue },
  ) => {
    const { email, password } = payload
    try {
      return await authGateway.signUpWithEmail(email, password)
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Unknown error occurred.',
      )
    }
  },
)

import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { SignUpCredentials } from '../authTypes'
import { AuthUser } from '../authUser'

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
    try {
      const { email, password } = payload
      return await authGateway.signUpWithEmail(email, password)
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Unknown error occurred.',
      )
    }
  },
)

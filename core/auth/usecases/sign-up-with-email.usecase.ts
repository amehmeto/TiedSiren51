import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { createAuthError } from '../authUser'

export const signUpWithEmail = createAppAsyncThunk(
  'auth/signUpWithEmail',
  async (
    payload: { email: string; password: string },
    { extra: { authGateway }, rejectWithValue },
  ) => {
    const { email, password } = payload
    try {
      return await authGateway.signUpWithEmail(email, password)
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(createAuthError(error.message))
      }
      return rejectWithValue(createAuthError('An unexpected error occurred'))
    }
  },
)

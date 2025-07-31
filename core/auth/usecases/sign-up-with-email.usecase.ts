import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { handleAuthError } from '../handleAuthError'

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
      return rejectWithValue(handleAuthError(error))
    }
  },
)

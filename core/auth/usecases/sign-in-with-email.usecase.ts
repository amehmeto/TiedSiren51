import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'

export const signInWithEmail = createAppAsyncThunk(
  'auth/signInWithEmail',
  async (
    payload: { email: string; password: string },
    { extra: { authGateway }, rejectWithValue },
  ) => {
    const { email, password } = payload
    try {
      return await authGateway.signInWithEmail(email, password)
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message)
      }
      return rejectWithValue('Unknown error')
    }
  },
)

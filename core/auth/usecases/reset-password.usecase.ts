import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'

export const resetPassword = createAppAsyncThunk<
  void,
  { email: string },
  { rejectValue: string }
>(
  'auth/resetPassword',
  async (payload, { extra: { authGateway }, rejectWithValue }) => {
    try {
      await authGateway.resetPassword(payload.email)
      return
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Unknown error occurred.',
      )
    }
  },
)

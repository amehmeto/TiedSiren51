import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { AuthUser } from '../authUser'

export const signInWithApple = createAppAsyncThunk<
  AuthUser,
  void,
  { rejectValue: string }
>(
  'auth/signInWithApple',
  async (_, { extra: { authGateway }, rejectWithValue }) => {
    try {
      return await authGateway.signInWithApple()
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Apple sign in failed',
      )
    }
  },
)

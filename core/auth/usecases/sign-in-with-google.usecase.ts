import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { AuthUser } from '../authUser'

export const signInWithGoogle = createAppAsyncThunk<
  AuthUser,
  void,
  { rejectValue: string }
>(
  'auth/signInWithGoogle',
  async (_, { extra: { authGateway }, rejectWithValue }) => {
    try {
      return await authGateway.signInWithGoogle()
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Google sign in failed',
      )
    }
  },
)

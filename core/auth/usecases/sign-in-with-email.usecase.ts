import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { LoginCredentials } from '../authTypes'
import { AuthUser } from '../authUser'

export const signInWithEmail = createAppAsyncThunk<
  AuthUser,
  LoginCredentials,
  { rejectValue: string }
>(
  'auth/signInWithEmail',
  async (payload, { extra: { authGateway }, rejectWithValue }) => {
    try {
      return await authGateway.signInWithEmail(payload.email, payload.password)
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Unknown error occurred.',
      )
    }
  },
)

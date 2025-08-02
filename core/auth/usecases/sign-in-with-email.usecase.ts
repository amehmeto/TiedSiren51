import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { handleAuthError } from '../handleAuthError'
import { AuthUser } from '../authUser'

export const signInWithEmail = createAppAsyncThunk<
  AuthUser,
  { email: string; password: string },
  { rejectValue: string }
>(
  'auth/signInWithEmail',
  async (payload, { extra: { authGateway }, rejectWithValue }) => {
    try {
      return await authGateway.signInWithEmail(payload.email, payload.password)
    } catch (error) {
      return rejectWithValue(handleAuthError(error))
    }
  },
)

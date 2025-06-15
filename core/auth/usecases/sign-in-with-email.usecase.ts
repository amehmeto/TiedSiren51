import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { isValidEmail } from '../validators/emailValidator'

export const signInWithEmail = createAppAsyncThunk(
  'auth/signInWithEmail',
  (
    payload: { email: string; password: string },
    { extra: { authGateway }, rejectWithValue },
  ) => {
    const { email, password } = payload
    if (!isValidEmail(email)) {
      return rejectWithValue('Please correct your email address')
    }
    return authGateway.signInWithEmail(email, password)
  },
)

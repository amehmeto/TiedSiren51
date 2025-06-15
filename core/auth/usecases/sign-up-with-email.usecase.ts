import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { isValidEmail } from '@/core/auth/validators/emailValidator'

export const signUpWithEmail = createAppAsyncThunk(
  'auth/signUpWithEmail',
  (
    payload: { email: string; password: string },
    { extra: { authGateway }, rejectWithValue },
  ) => {
    const { email, password } = payload
    if (!isValidEmail(email)) {
      return rejectWithValue('Please correct your email address')
    }
    return authGateway.signUpWithEmail(email, password)
  },
)

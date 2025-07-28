import { validateSignUpInput } from '../validators/validateSignUpInput'

import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'

export const signUpWithEmail = createAppAsyncThunk(
  'auth/signUpWithEmail',
  (
    payload: { email: string; password: string },
    { extra: { authGateway }, rejectWithValue },
  ) => {
    const { email, password } = payload
    const validationError = validateSignUpInput(email, password)
    if (validationError) {
      return rejectWithValue(validationError)
    }
    return authGateway.signUpWithEmail(email, password)
  },
)

import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'

export const signUpWithEmail = createAppAsyncThunk(
  'auth/signUpWithEmail',
  (
    payload: { email: string; password: string },
    { extra: { authGateway } },
  ) => {
    const { email, password } = payload
    return authGateway.signUpWithEmail(email, password)
  },
)

import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'

export const authenticateWithEmail = createAppAsyncThunk(
  'auth/authenticateWithEmail',
  (
    payload: { email: string; password: string },
    { extra: { authGateway } },
  ) => {
    const { email, password } = payload
    return authGateway.authenticateWithEmail(email, password)
  },
)

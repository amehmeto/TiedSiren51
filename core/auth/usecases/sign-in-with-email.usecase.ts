import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'

export const signInWithEmail = createAppAsyncThunk(
  'auth/signInWithEmail',
  (
    payload: { email: string; password: string },
    { extra: { authGateway } },
  ) => {
    const { email, password } = payload
    return authGateway.signInWithEmail(email, password)
  },
)

import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'

export const signInWithGoogle = createAppAsyncThunk(
  'auth/signInWithGoogle',
  (_, { extra: { authGateway } }) => {
    return authGateway.signInWithGoogle()
  },
)

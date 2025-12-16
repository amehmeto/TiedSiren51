import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'

export const resetPassword = createAppAsyncThunk<void, { email: string }>(
  'auth/resetPassword',
  async (payload, { extra: { authGateway } }) => {
    await authGateway.resetPassword(payload.email)
  },
)

import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'

export const sendVerificationEmail = createAppAsyncThunk<void, void>(
  'auth/sendVerificationEmail',
  async (_payload, { extra: { authGateway } }) => {
    await authGateway.sendVerificationEmail()
  },
)

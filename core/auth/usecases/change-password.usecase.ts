import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'

export const changePassword = createAppAsyncThunk<
  void,
  { newPassword: string }
>(
  'auth/changePassword',
  async ({ newPassword }, { extra: { authGateway } }) => {
    await authGateway.changePassword(newPassword)
  },
)

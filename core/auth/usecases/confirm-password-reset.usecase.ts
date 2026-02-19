import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'

type ConfirmPasswordResetPayload = {
  oobCode: string
  newPassword: string
}

export const confirmPasswordReset = createAppAsyncThunk<
  void,
  ConfirmPasswordResetPayload
>('auth/confirmPasswordReset', async (payload, { extra: { authGateway } }) => {
  await authGateway.confirmPasswordReset(payload.oobCode, payload.newPassword)
})

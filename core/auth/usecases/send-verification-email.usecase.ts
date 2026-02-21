import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { showToast } from '@/core/toast/toast.slice'

export const sendVerificationEmail = createAppAsyncThunk<void, void>(
  'auth/sendVerificationEmail',
  async (_payload, { extra: { authGateway }, dispatch }) => {
    await authGateway.sendVerificationEmail()
    dispatch(showToast('Verification email sent! Check your inbox.'))
  },
)

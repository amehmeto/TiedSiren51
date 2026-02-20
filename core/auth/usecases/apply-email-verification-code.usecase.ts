import { EmailVerificationResult } from '@/core/_ports_/auth.gateway'
import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { showToast } from '@/core/toast/toast.slice'

export const applyEmailVerificationCode = createAppAsyncThunk<void, string>(
  'auth/applyEmailVerificationCode',
  async (oobCode, { extra: { authGateway }, dispatch }) => {
    const verificationResult =
      await authGateway.applyEmailVerificationCode(oobCode)
    const toastMessage =
      verificationResult === EmailVerificationResult.AlreadyVerified
        ? 'Email is already verified.'
        : 'Email verified!'
    dispatch(showToast(toastMessage))
  },
)

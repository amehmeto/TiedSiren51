import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { showToast } from '@/core/toast/toast.slice'

export const applyEmailVerificationCode = createAppAsyncThunk<void, string>(
  'auth/applyEmailVerificationCode',
  async (oobCode, { extra: { authGateway }, dispatch }) => {
    const isAlreadyVerified = await authGateway.refreshEmailVerificationStatus()
    if (isAlreadyVerified) {
      dispatch(showToast('Email is already verified.'))
      return
    }

    await authGateway.applyEmailVerificationCode(oobCode)
    dispatch(showToast('Email verified!'))
  },
)

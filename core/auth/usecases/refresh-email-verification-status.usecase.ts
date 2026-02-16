import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { showToast } from '@/core/toast/toast.slice'

export const refreshEmailVerificationStatus = createAppAsyncThunk<
  boolean,
  void
>(
  'auth/refreshEmailVerificationStatus',
  async (_payload, { extra: { authGateway }, dispatch }) => {
    const isVerified = await authGateway.refreshEmailVerificationStatus()
    if (isVerified) dispatch(showToast('Email verified successfully!'))
    return isVerified
  },
)

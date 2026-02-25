import { ISODateString } from '@/core/_ports_/date-provider'
import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { showToast } from '@/core/toast/toast.slice'

export const resetPassword = createAppAsyncThunk<
  ISODateString,
  { email: string }
>(
  'auth/resetPassword',
  async (
    payload,
    { extra: { authGateway, dateProvider }, dispatch, getState },
  ) => {
    const isResend = getState().auth.lastPasswordResetRequestAt !== null
    await authGateway.resetPassword(payload.email)
    if (isResend)
      dispatch(showToast('Password reset email sent! Check your inbox.'))

    return dateProvider.getISOStringNow()
  },
)

import { ISODateString } from '@/core/_ports_/date-provider'
import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'

export const reauthenticateWithGoogle = createAppAsyncThunk<
  ISODateString,
  void
>(
  'auth/reauthenticateWithGoogle',
  async (_, { extra: { authGateway, dateProvider } }) => {
    await authGateway.reauthenticateWithGoogle()
    return dateProvider.getISOStringNow()
  },
)

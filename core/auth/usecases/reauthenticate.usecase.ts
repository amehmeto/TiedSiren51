import { ISODateString } from '@/core/_ports_/date-provider'
import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'

export const reauthenticate = createAppAsyncThunk<
  ISODateString,
  { password: string }
>(
  'auth/reauthenticate',
  async ({ password }, { extra: { authGateway, dateProvider } }) => {
    await authGateway.reauthenticate(password)
    return dateProvider.getISOStringNow()
  },
)

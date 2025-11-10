import { createAppAsyncThunk } from '../../_redux_/create-app-thunk'
import { UpdatePayload } from '../../ports/update.payload'
import { Blocklist } from '../blocklist'

export const updateBlocklist = createAppAsyncThunk(
  'blocklist/updateBlocklist',
  async (
    payload: UpdatePayload<Blocklist>,
    { extra: { blocklistRepository } },
  ) => {
    await blocklistRepository.update(payload)
    return payload
  },
)

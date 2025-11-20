import { UpdatePayload } from '../../_ports_/update.payload'
import { createAppAsyncThunk } from '../../_redux_/create-app-thunk'
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

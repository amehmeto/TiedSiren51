import { createAppAsyncThunk } from '../../_redux_/create-app-thunk'
import { CreatePayload } from '../../ports/create.payload'
import { Blocklist } from '../blocklist'

export const createBlocklist = createAppAsyncThunk(
  'blocklist/createBlocklist',
  async (
    payload: CreatePayload<Blocklist>,
    { extra: { blocklistRepository } },
  ) => {
    return blocklistRepository.create(payload)
  },
)

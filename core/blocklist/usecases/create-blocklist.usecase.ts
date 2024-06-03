import { createAppAsyncThunk } from '../../_redux_/create-app-thunk'
import { Blocklist } from '../blocklist'
import { CreatePayload } from '../../ports/create.payload'

export const createBlocklist = createAppAsyncThunk(
  'blocklist/createBlocklist',
  async (
    payload: CreatePayload<Blocklist>,
    { extra: { blocklistRepository } },
  ) => {
    return blocklistRepository.create(payload)
  },
)

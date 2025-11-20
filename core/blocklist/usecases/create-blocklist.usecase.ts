import { CreatePayload } from '../../_ports_/create.payload'
import { createAppAsyncThunk } from '../../_redux_/create-app-thunk'
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

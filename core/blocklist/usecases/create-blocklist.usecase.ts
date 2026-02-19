import { CreatePayload } from '../../_ports_/create.payload'
import { createAppAsyncThunk } from '../../_redux_/create-app-thunk'
import { selectAuthUserId } from '../../auth/selectors/selectAuthUserId'
import { Blocklist } from '../blocklist'

export const createBlocklist = createAppAsyncThunk(
  'blocklist/createBlocklist',
  async (
    payload: CreatePayload<Blocklist>,
    { extra: { blocklistRepository }, getState },
  ) => {
    const userId = selectAuthUserId(getState())
    return blocklistRepository.create(userId, payload)
  },
)

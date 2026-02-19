import { UpdatePayload } from '../../_ports_/update.payload'
import { createAppAsyncThunk } from '../../_redux_/create-app-thunk'
import { selectAuthUserId } from '../../auth/selectors/selectAuthUserId'
import { Blocklist } from '../blocklist'

export const updateBlocklist = createAppAsyncThunk(
  'blocklist/updateBlocklist',
  async (
    payload: UpdatePayload<Blocklist>,
    { extra: { blocklistRepository }, getState },
  ) => {
    const userId = selectAuthUserId(getState())
    await blocklistRepository.update(userId, payload)
    return payload
  },
)

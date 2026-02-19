import { createAppAsyncThunk } from '../../_redux_/create-app-thunk'
import { selectAuthUserId } from '../../auth/selectors/selectAuthUserId'

type RenameBlocklistPayload = { id: string; name: string }

export const renameBlocklist = createAppAsyncThunk(
  'blocklist/renameBlocklist',
  async (
    payload: RenameBlocklistPayload,
    { extra: { blocklistRepository }, getState },
  ) => {
    const userId = selectAuthUserId(getState())
    await blocklistRepository.update(userId, {
      ...payload,
    })
    return payload
  },
)

import { createAppAsyncThunk } from '../../_redux_/create-app-thunk'
import { selectAuthUserId } from '../../auth/selectors/selectAuthUserId'

export const deleteBlocklist = createAppAsyncThunk(
  'blocklist/deleteBlocklist',
  async (blocklistId: string, { extra: { blocklistRepository }, getState }) => {
    const userId = selectAuthUserId(getState())
    await blocklistRepository.delete(userId, blocklistId)
    return blocklistId
  },
)

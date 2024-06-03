import { createAppAsyncThunk } from '../../_redux_/create-app-thunk'

export const deleteBlocklist = createAppAsyncThunk(
  'blocklist/deleteBlocklist',
  async (blocklistId: string, { extra: { blocklistRepository } }) => {
    await blocklistRepository.delete(blocklistId)
    return blocklistId
  },
)

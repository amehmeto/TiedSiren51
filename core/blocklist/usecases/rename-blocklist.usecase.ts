import { createAppAsyncThunk } from '../../_redux_/create-app-thunk'

type RenameBlocklistPayload = { id: string; name: string }

export const renameBlocklist = createAppAsyncThunk(
  'blocklist/renameBlocklist',
  async (
    payload: RenameBlocklistPayload,
    { extra: { blocklistRepository } },
  ) => {
    await blocklistRepository.update({
      ...payload,
    })
    return payload
  },
)

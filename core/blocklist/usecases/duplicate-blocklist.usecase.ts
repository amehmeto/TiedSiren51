import { createAppAsyncThunk } from '../../_redux_/create-app-thunk'

export const duplicateBlocklist = createAppAsyncThunk(
  'blocklist/duplicateBlocklist',
  async (
    payload: { id: string; name: string },
    { extra: { blocklistRepository } },
  ) => {
    const blocklistToBeCopied = await blocklistRepository.findById(payload.id)
    const { id: _id, ...blocklistToBeCopiedWithoutId } = blocklistToBeCopied
    return blocklistRepository.create({
      ...blocklistToBeCopiedWithoutId,
      name: payload.name,
    })
  },
)

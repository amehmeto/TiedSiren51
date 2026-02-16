import { createAppAsyncThunk } from '../../_redux_/create-app-thunk'

type DuplicateBlocklistPayload = { id: string; name: string }

export const duplicateBlocklist = createAppAsyncThunk(
  'blocklist/duplicateBlocklist',
  async (
    payload: DuplicateBlocklistPayload,
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

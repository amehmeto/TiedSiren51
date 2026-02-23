import { createAppAsyncThunk } from '../../_redux_/create-app-thunk'
import { selectAuthUserId } from '../../auth/selectors/selectAuthUserId'

type DuplicateBlocklistPayload = { id: string; name: string }

export const duplicateBlocklist = createAppAsyncThunk(
  'blocklist/duplicateBlocklist',
  async (
    payload: DuplicateBlocklistPayload,
    { getState, extra: { blocklistRepository } },
  ) => {
    const userId = selectAuthUserId(getState())
    const blocklistToBeCopied = await blocklistRepository.findById(
      userId,
      payload.id,
    )
    const { id: _id, ...blocklistToBeCopiedWithoutId } = blocklistToBeCopied
    return blocklistRepository.create(userId, {
      ...blocklistToBeCopiedWithoutId,
      name: payload.name,
    })
  },
)

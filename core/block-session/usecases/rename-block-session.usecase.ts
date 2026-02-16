import { createAppAsyncThunk } from '../../_redux_/create-app-thunk'

type RenameBlockSessionPayload = { id: string; name: string }

export const renameBlockSession = createAppAsyncThunk(
  'blockSession/renameBlockSession',
  async (
    payload: RenameBlockSessionPayload,
    { extra: { blockSessionRepository } },
  ) => {
    await blockSessionRepository.update({
      ...payload,
    })
    return payload
  },
)

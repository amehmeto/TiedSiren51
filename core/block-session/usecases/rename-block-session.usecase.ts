import { createAppAsyncThunk } from '../../_redux_/create-app-thunk'

export const renameBlockSession = createAppAsyncThunk(
  'blockSession/renameBlockSession',
  async (
    payload: { id: string; name: string },
    { extra: { blockSessionRepository } },
  ) => {
    await blockSessionRepository.update({
      ...payload,
    })
    return payload
  },
)

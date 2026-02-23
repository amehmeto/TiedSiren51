import { createAppAsyncThunk } from '../../_redux_/create-app-thunk'
import { selectAuthUserId } from '../../auth/selectors/selectAuthUserId'

type RenameBlockSessionPayload = { id: string; name: string }

export const renameBlockSession = createAppAsyncThunk(
  'blockSession/renameBlockSession',
  async (
    payload: RenameBlockSessionPayload,
    { getState, extra: { blockSessionRepository } },
  ) => {
    const userId = selectAuthUserId(getState())
    await blockSessionRepository.update(userId, { ...payload })
    return payload
  },
)

import { createAppAsyncThunk } from '../../_redux_/create-app-thunk'

export const duplicateBlockSession = createAppAsyncThunk(
  'blockSession/duplicateBlockSession',
  async (
    payload: { id: string; name: string },
    { extra: { blockSessionRepository } },
  ) => {
    const sessionToBeCopied = await blockSessionRepository.findById(payload.id)

    const { id, ...sessionWithoutId } = sessionToBeCopied
    const duplicatedSession = {
      ...sessionWithoutId,
      name: payload.name,
      startNotificationId: '',
      endNotificationId: '',
    }
    return blockSessionRepository.create(duplicatedSession)
  },
)

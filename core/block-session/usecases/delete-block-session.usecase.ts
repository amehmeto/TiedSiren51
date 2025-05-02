import { createAppAsyncThunk } from '../../_redux_/create-app-thunk'

export const deleteBlockSession = createAppAsyncThunk(
  'blockSession/deleteBlockSession',
  async (sessionId: string, { extra: { blockSessionRepository } }) => {
    // Just delete the session without canceling notifications
    // as we're now using real-time notifications
    await blockSessionRepository.delete(sessionId)
    return sessionId
  },
)

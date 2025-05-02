import { createAppAsyncThunk } from '../../_redux_/create-app-thunk'
import { handleSessionStatusChangeForCrud } from './handle-session-status-change.usecase'

export const renameBlockSession = createAppAsyncThunk(
  'blockSession/renameBlockSession',
  async (
    payload: { id: string; name: string },
    { extra: { blockSessionRepository, dateProvider }, dispatch },
  ) => {
    // Get existing session before update
    const existingSession = await blockSessionRepository.findById(payload.id)

    // Update the session name
    await blockSessionRepository.update({
      ...payload,
    })

    // Get the updated session
    const updatedSession = await blockSessionRepository.findById(payload.id)

    // Check for any status changes (unlikely from just a rename, but good practice)
    await handleSessionStatusChangeForCrud(
      dispatch,
      dateProvider,
      existingSession,
      updatedSession,
      'update',
    )

    return payload
  },
)

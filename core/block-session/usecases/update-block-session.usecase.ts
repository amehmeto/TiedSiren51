import { BlockSession } from '../block.session'
import { createAppAsyncThunk } from '../../_redux_/create-app-thunk'
import { UpdatePayload } from '../../ports/update.payload'
import { handleSessionStatusChangeForCrud } from './handle-session-status-change.usecase'

export type UpdateBlockSessionPayload = UpdatePayload<BlockSession>

export const updateBlockSession = createAppAsyncThunk(
  'blockSession/updateBlockSession',
  async (
    payload: UpdateBlockSessionPayload,
    { extra: { blockSessionRepository, dateProvider }, dispatch },
  ) => {
    const existingBlockSession = await blockSessionRepository.findById(
      payload.id,
    )

    // We'll keep the same notification IDs (empty strings)
    // Real-time notifications will be handled by the core notification system
    const toUpdateBlockSession = {
      ...payload,
      startNotificationId: existingBlockSession.startNotificationId,
      endNotificationId: existingBlockSession.endNotificationId,
    }

    await blockSessionRepository.update(toUpdateBlockSession)

    // Get updated session to check its current state
    const updatedSession = await blockSessionRepository.findById(payload.id)

    // Handle notification for the updated session
    await handleSessionStatusChangeForCrud(
      dispatch,
      dateProvider,
      existingBlockSession,
      updatedSession,
      'update',
    )

    return toUpdateBlockSession
  },
)

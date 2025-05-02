import { BlockSession } from '../block.session'
import { createAppAsyncThunk } from '../../_redux_/create-app-thunk'
import { UpdatePayload } from '../../ports/update.payload'

export type UpdateBlockSessionPayload = UpdatePayload<BlockSession>

export const updateBlockSession = createAppAsyncThunk(
  'blockSession/updateBlockSession',
  async (
    payload: UpdateBlockSessionPayload,
    { extra: { blockSessionRepository } },
  ) => {
    const existingBlockSession = await blockSessionRepository.findById(
      payload.id,
    )

    // We'll keep the same notification IDs (empty strings)
    // Real-time notifications will be handled by the home screen
    const toUpdateBlockSession = {
      ...payload,
      startNotificationId: existingBlockSession.startNotificationId,
      endNotificationId: existingBlockSession.endNotificationId,
    }

    await blockSessionRepository.update(toUpdateBlockSession)
    return toUpdateBlockSession
  },
)

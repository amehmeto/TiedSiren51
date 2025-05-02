import { createAppAsyncThunk } from '../../_redux_/create-app-thunk'
import { BlockSession } from '../block.session'

export type CreateBlockSessionPayload = Omit<
  BlockSession,
  'id' | 'startNotificationId' | 'endNotificationId'
>
export const createBlockSession = createAppAsyncThunk(
  'blockSession/createBlockSession',
  async (
    payload: CreateBlockSessionPayload,
    { extra: { blockSessionRepository, backgroundTaskService } },
  ) => {
    await backgroundTaskService.scheduleTask('tie-sirens')

    // Create the block session without notification IDs
    // Real-time notifications will be handled by the home screen
    return blockSessionRepository.create({
      ...payload,
      startNotificationId: '', // Using empty string as we don't schedule notifications here anymore
      endNotificationId: '', // Using empty string as we don't schedule notifications here anymore
    })
  },
)

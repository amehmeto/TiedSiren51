import { createAppAsyncThunk } from '../../_redux_/create-app-thunk'
import { BlockSession } from '../block.session'
import { handleSessionStatusChangeForCrud } from './handle-session-status-change.usecase'

export type CreateBlockSessionPayload = Omit<
  BlockSession,
  'id' | 'startNotificationId' | 'endNotificationId'
>
export const createBlockSession = createAppAsyncThunk(
  'blockSession/createBlockSession',
  async (
    payload: CreateBlockSessionPayload,
    {
      extra: {
        blockSessionRepository,
        backgroundTaskService,
        dateProvider,
        notificationService,
      },
      dispatch,
    },
  ) => {
    await backgroundTaskService.scheduleTask('tie-sirens')

    // Create the block session without notification IDs
    const createdSession = await blockSessionRepository.create({
      ...payload,
      startNotificationId: '', // Using empty string as we don't schedule notifications here anymore
      endNotificationId: '', // Using empty string as we don't schedule notifications here anymore
    })

    // Handle notification for the newly created session
    await handleSessionStatusChangeForCrud(
      dispatch,
      dateProvider,
      null, // No previous session
      createdSession,
      'create',
      {
        scheduleTestNotifications: true,
        notificationService,
      },
    )

    return createdSession
  },
)

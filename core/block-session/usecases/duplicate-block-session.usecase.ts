import { createAppAsyncThunk } from '../../_redux_/create-app-thunk'
import { handleSessionStatusChangeForCrud } from './handle-session-status-change.usecase'

export const duplicateBlockSession = createAppAsyncThunk(
  'blockSession/duplicateBlockSession',
  async (
    payload: { id: string; name: string },
    {
      extra: { blockSessionRepository, dateProvider, notificationService },
      dispatch,
    },
  ) => {
    const sessionToBeCopied = await blockSessionRepository.findById(payload.id)

    const { id, ...sessionWithoutId } = sessionToBeCopied
    const duplicatedSession = {
      ...sessionWithoutId,
      name: payload.name,
      startNotificationId: '',
      endNotificationId: '',
    }

    const createdSession =
      await blockSessionRepository.create(duplicatedSession)

    // Handle notification for the duplicated session
    await handleSessionStatusChangeForCrud(
      dispatch,
      dateProvider,
      null, // No previous session
      createdSession,
      'duplicate',
      {
        scheduleTestNotifications: true,
        notificationService,
      },
    )

    return createdSession
  },
)

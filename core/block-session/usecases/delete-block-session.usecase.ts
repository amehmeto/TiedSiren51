import { createAppAsyncThunk } from '../../_redux_/create-app-thunk'
import { handleSessionStatusChangeForCrud } from './handle-session-status-change.usecase'

export const deleteBlockSession = createAppAsyncThunk(
  'blockSession/deleteBlockSession',
  async (
    sessionId: string,
    {
      extra: { blockSessionRepository, dateProvider, notificationService },
      dispatch,
    },
  ) => {
    // First get the session to check its status before deletion
    const sessionToDelete = await blockSessionRepository.findById(sessionId)

    // Delete the session
    await blockSessionRepository.delete(sessionId)

    // Handle notification for the deleted session
    await handleSessionStatusChangeForCrud(
      dispatch,
      dateProvider,
      sessionToDelete,
      null, // No new session
      'delete',
      {
        scheduleTestNotifications: true,
        notificationService,
      },
    )

    return sessionId
  },
)
